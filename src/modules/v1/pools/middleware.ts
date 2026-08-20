/** @format */

import { Request, Response, NextFunction } from "express"
import { catchError, tryPromise } from "../../common/utils"
import PoolService from "./service"
import { debitWallet } from "../wallets/helper"
import { db } from "../../../databases/connection"
import CompetitionService from "../competitions/service"

export const validateCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, config, competition } = req.body
    try {
        const [pool, error] = await tryPromise(
            new PoolService({ name }).findOne()
        )

        if (error) throw catchError("Error processing request", 400)
        if (pool) throw catchError("Name already taken. Use another name", 400)

        const [comp, compError] = await tryPromise(
            new CompetitionService({ _id: competition }).findOne()
        )

        if (compError) throw catchError("Error processing request", 400)
        if (!comp) throw catchError("Competition does not exist", 400)

        if (config.paid && config.amount) {
            const session = await db.startSession()
            await session.withTransaction(async () => {
                await debitWallet({
                    userId: String(req.user._id),
                    session: session,
                    amount: config.amount,
                    isWithdrawal: false,
                    pendingTransaction: false,
                    transactionMeta: { pool: name, action: "create pool" },
                })
            })
        }

        return next()
    } catch (error) {
        next(error)
    }
}
