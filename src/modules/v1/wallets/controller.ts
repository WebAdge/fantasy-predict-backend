/** @format */
import { NextFunction, Request, Response } from "express"

import {
    catchError,
    createReference,
    success,
    tryPromise,
} from "../../common/utils"
import WalletService from "./service"
import { paystackCharge } from "../../common/utils/charges"
import UserService from "../users/service"
import { configs } from "../../common/utils/config"
import Paystack from "../../thirdpartyApi/paystack"
import { composePaymentBody, creditWallet } from "./helper"
import { db } from "../../../databases/connection"
import TransactionService from "../transactions/service"


export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let result
        const [wallet, error] = await tryPromise(
            new WalletService({ user: String(req.user._id) }).findOne()
        )

        if (error) throw catchError("Error processing request", 500)

        result = wallet
        if (!wallet) {
            const [newWallet, newError] = await tryPromise(
                new WalletService({}).create({
                    user: String(req.user._id),
                    balance: 0,
                    currency: "NGN",
                })
            )
            if (newError) throw catchError("Error processing request", 500)
            result = newWallet
        }

        return res
            .status(200)
            .json(success("Account created successfully", { wallet: result }))
    } catch (error) {
        next(error)
    }
}

export const securePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, amount } = req.query

    const reference = createReference()

    const amountInKobo = Number(amount) * 100
    const calculateAmount = paystackCharge.calculateFundingAmount(amountInKobo)
    try {
        const user = await new UserService({
            email: decodeURIComponent(email as string),
        }).findOne()
        if (!user) throw catchError("Invalid Access", 400)
        const wallet = await new WalletService({
            user: String(user._id),
        }).findOne()
        if (!wallet)
            throw catchError("Something went wrong on our end. Please reload")

        await new TransactionService({}).create({
            user: String(user._id),
            fee: calculateAmount.totalFee / 100,
            amount:
                calculateAmount.totalFee / 100 - calculateAmount.charge / 100,
            wallet: String(wallet._id),
            status: "pending",
            type: "credit",
            reference,
            currency: "NGN",
            wasReverted: false,
            wasRefunded: false,
            dateInitiated: new Date(),
            meta: {
                calculateAmount,
                base_url: configs.BACKEND_URL,
                fullName: `${user.firstName} ${user.lastName}`,
                redirectUrl: process.env.PAY_REDIRECTION,
            },
        })

        return res.render("payment.ejs", {
            email: user.email,
            reference,
            customerId: String(user._id),
            amount: calculateAmount.totalFee,
            paymentType: "fund-account",
            phone: user.phoneNumber,
            base_url: configs.BACKEND_URL,
            fullName: `${user.firstName} ${user.lastName}`,
            redirectUrl: process.env.PAY_REDIRECTION,
            key:
                configs.NODE_ENV === "production"
                    ? configs.PAYSTACK_PROD_PUBLIC
                    : configs.PAYSTACK_PUBLIC,
        })
    } catch (error) {
        next(error)
    }
}

export const webhook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log({ header: req.headers })
        console.log(req.body)
        return res.status(200).json({ success: true })
    } catch (error) {
        next(error)
    }
}

export const verifyTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { reference } = req.body
    try {
        const localTrans = await new TransactionService({
            reference: String(reference),
            status: "pending",
        }).findOne()
        console.log({ localTrans })
        if (!localTrans) throw catchError("Transaction not found")
        if (localTrans.status === "pending") {
            const trans = await new Paystack(reference).verifyTransaction()
            if (trans && trans.status === "success") {
                const session = await db.startSession()
                await session.withTransaction(async () => {
                    await creditWallet({
                        _id: String(localTrans._id),
                        userId: localTrans.user,
                        session,
                        amount: Number(localTrans.amount),
                        pendingTransaction: false,
                        transactionMeta: { ...trans },
                    })
                })
                await session.endSession()
            }
        }

        return res.status(200).json({ success: true })
    } catch (error) {
        next(error)
    }
}

export const initializeSarepayPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { amount } = req.body
    try {
        const body = composePaymentBody(req, Number(amount))
        // @ts-ignore
        const data = await new Sarepay().initializeHostedPayment(body)
        return res.status(200).json(success("Payment initialized", data))
    } catch (error) {
        next(error)
    }
}
