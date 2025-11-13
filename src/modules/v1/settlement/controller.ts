/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError } from "../../common/utils"
import SettlementService from "./service"
import { db } from "../../../databases/connection"
import WalletService from "../wallets/service"
import { creditWallet } from "../wallets/helper"

/**
 * Add agenda when updating wallet fails
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const processIncomingTransfer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { data } = req.body
    try {
        const session = await db.startSession()
        await session.withTransaction(async () => {
            const wallet = await new WalletService({
                "bank.accountNumber": data.recipient,
            }).findOne(session)
            if (!wallet) throw catchError("Account does not exist", 400)
            const settlement = await new SettlementService({}).create(
                {
                    type: "SETTLEMENT",
                    meta: { ...data },
                    status: "successful",
                },
                session
            )
            await creditWallet({
                userId: wallet.user,
                session,
                amount: Number(data.expectedAmount || 0),
                _id: String(settlement._id),
                pendingTransaction: false,
                transactionMeta: data,
            })
        })

        await session.endSession()

        // agenda.schedule("in 1 second", agendaDefinition.PROCESS_SETTLEMENT, { settlementId: settlement?.id })
        return res.status(200).json({ success: true })
    } catch (error) {
        next(error)
    }
}
