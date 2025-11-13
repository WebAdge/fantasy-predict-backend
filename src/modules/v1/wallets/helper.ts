/** @format */

import { Request } from "express"
import WalletService from "./service"
import { ClientSession } from "mongoose"
import { catchError, createReference, generateRandomDigit, tryPromise } from "../../common/utils"
import { composeTransactionDoc } from "../transactions/helper"
import TransactionService from "../transactions/service"
import { TRANSACTION_STATUS } from "../transactions/constant"
import { configs } from "../../common/utils/config"

export const composeFilter = (req: Request) => {
    const { firstName, lastName, email, phoneNumber, isActive } = req.query
    let filter = {}

    if (firstName) filter = { ...filter, firstName }
    if (lastName) filter = { ...filter, lastName }
    if (email) filter = { ...filter, email }
    if (phoneNumber) filter = { ...filter, phoneNumber }
    if (isActive !== undefined)
        filter = { ...filter, resolved: JSON.parse(isActive as string) }

    return filter
}

type Props = {
    userId: string
    session: ClientSession
    amount: number
    isWithdrawal: boolean
    pendingTransaction: boolean
    transactionMeta?: Record<string, any>
}

export const debitWallet = async (params: Props) => {
    const { userId, session, amount } = params
    const [wallet, error] = await tryPromise(
        new WalletService({ user: userId }).findOne({ session })
    )

    if (error) throw catchError("Error processing request")
    if (!wallet)
        throw catchError("You cannot perform this operation at this moment")
    if (Number(amount) > Number(wallet.balance))
        throw catchError("Insufficient balance")

    await new TransactionService({}).create(
        composeTransactionDoc({
            wallet,
            amount,
            status: params.pendingTransaction
                ? TRANSACTION_STATUS.PENDING
                : TRANSACTION_STATUS.SUCCESSFUL,
            meta: params.transactionMeta,
        }),
        session
    )
    const [currentWallet] = await Promise.all([
        new WalletService({ _id: wallet._id }).update(
            { balance: Number(wallet.balance) - Number(amount) },
            session
        ),
    ])

    return { currentWallet }
}

type CreditProps = {
    userId: string
    session: ClientSession
    amount: number
    _id: string
    pendingTransaction: boolean
    transactionMeta?: Record<string, any>
}

export const creditWallet = async (params: CreditProps) => {
    const { userId, session, amount } = params
    const [wallet, error] = await tryPromise(
        new WalletService({ user: userId }).findOne({ session })
    )

    if (error) throw catchError("Error processing request")
    if (!wallet)
        throw catchError("You cannot perform this operation at this moment")

    const transaction = await new TransactionService({
        user: params.userId,
        _id: String(params._id),
    }).update({ status: "successful", dateCompleted: new Date() }, session)

    const [currentWallet] = await Promise.all([
        new WalletService({ _id: wallet._id }).update(
            {
                balance: Number(wallet.balance) + Number(amount),
                dateOfLastTopUp: new Date(),
            },
            session
        ),
    ])

    return { currentWallet, transaction }
}

export const composePaymentBody = (req: Request, amount: number) => {
    const { firstName, lastName, email, _id } = req.user;
    const values = {
        key: configs.SAREPAY_PUBLIC_KEY,
        token: configs.SAREPAY_TOKEN,
        amount,
        currency: "NGN",
        feeBearer: "merchant",
        defaultPaymentMethod: "card",
        paymentMethods: [],
        customer: {
            name: `${firstName} ${lastName}`,
            email
        },
        containerId: generateRandomDigit(10000, 99999),
        metadata: {
            taxIs: "",
            customerId: _id,
            redirect_url: "https://www.predictcontest.com/wallet"
        },
        reference: createReference(),
    }

    return values
}
