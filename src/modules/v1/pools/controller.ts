/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import PoolService from "./service"
import { encryptData } from "../../common/hashings"
import { composeFilter, generateInviteCode } from "./helper"
import { db } from "../../../databases/connection"
import PoolMemberService from "../pool-members/service"
import { debitWallet } from "../wallets/helper"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let _id = ''
        const code = generateInviteCode()
        const session = await db.startSession()
        await session.withTransaction(async () => {
            const [newPool, crtError] = await tryPromise(
                new PoolService({}).create(
                    {
                        ...req.body,
                        config: {
                            poolSharing: "top-three",
                            ...req.body.config,
                            code,
                        },
                        createdBy: req.user._id,
                        totalMembers: 1,
                        password: encryptData(req.body.password),
                    },
                    session
                )
            )

            if (crtError) throw catchError("An error occurred! Try again", 400)
            _id = newPool?._id || '';

            if (Number(req.body.config.amount)) {
                await debitWallet({
                    userId: String(req.user._id),
                    session,
                    amount: Number(req.body.config.amount),
                    isWithdrawal: false,
                    pendingTransaction: false,
                    transactionMeta: { ...req.body, action: "Create Pool" },
                })
            }
            await new PoolMemberService({}).create(
                {
                    pool: String(newPool?._id),
                    user: String(req.user._id),
                    gameWeeksParticipated: [],
                    totalAmountSpent: req.body.config.amount,
                    status: "approved" as any,
                    type: "captain",
                },
                session
            )
        })

        return res
            .status(201)
            .json(success("Pool created successfully", {
                code,
                _id,
            }, {}))
    } catch (error) {
        next(error)
    }
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page, limit = 100 } = req.query
    try {
        const [pools, error] = await tryPromise(
            new PoolService({}).findAll(
                composeFilter(req),
                Number(page),
                Number(limit),
                [
                    {
                        path: "createdBy",
                        select: "firstName lastName avatar username",
                    },
                    { path: "competition", select: "name logo code" },
                ]
            )
        )

        if (error) throw catchError("Errors retrieving users", 400)
        let result = pools
        if (result) {
            result.docs = result?.docs.map(doc => ({
                ...doc,
                // @ts-ignore
                isCreator: String(doc.createdBy._id) === String(req.user._id),
            }))
        }

        return res.status(200).json(success("Pools retrieved", result))
    } catch (error) {
        next(error)
    }
}

export const poolLeaderboar = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [pools, error] = await tryPromise(
            new PoolService({}).poolLeaderboard(String(req.user._id))
        )

        if (error) throw catchError("Errors retrieving users", 400)

        return res.status(200).json(success("Pools retrieved", pools))
    } catch (error) {
        next(error)
    }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pool = await new PoolService({ _id: req.params.id }).findOne({
            populate: [
                {
                    path: "createdBy",
                    select: "firstName lastName avatar username",
                },
                { path: "competition", select: "name logo code" },
            ],
        })

        return res.status(200).json(success("Pool retrieved", pool))
    } catch (error) {
        next(error)
    }
}
