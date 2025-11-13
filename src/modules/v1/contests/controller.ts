/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import { composeFilter, generateInviteCode } from "./helper"
import { db } from "../../../databases/connection"
import { debitWallet } from "../wallets/helper"
import MemberService from "../members/service"
import ContestService from "./service"
import { isAfter } from "date-fns"

// All created contest are public and available for all to see
export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { amount } = req.body
    try {
        const code = generateInviteCode()
        const session = await db.startSession()
        await session.withTransaction(async () => {
            const [newcontest, crtError] = await tryPromise(
                new ContestService({}).create(
                    {
                        ...req.body,
                        user: req.user._id,
                        totalUsersJoined: 1,
                        invitationCode: code,
                    },
                    session
                )
            )

            if (crtError) throw catchError("An error occurred! Try again", 400)

            if (Number(amount)) {
                await debitWallet({
                    userId: String(req.user._id),
                    session,
                    amount: Number(amount),
                    isWithdrawal: false,
                    pendingTransaction: false,
                    transactionMeta: { ...req.body, action: "Create contest" },
                })
            }
            await new MemberService({}).create(
                {
                    contest: String(newcontest?._id),
                    user: String(req.user._id),
                    status: "approved" as any,
                    type: "captain",
                },
                session
            )
        })

        return res
            .status(201)
            .json(success("Contest created successfully", {}, {}))
    } catch (error) {
        next(error)
    }
}

export const join = async (req: Request, res: Response, next: NextFunction) => {
    const { invitationCode } = req.body
    try {
        const dbContest = await new ContestService({
            invitationCode,
            endDate: { $gte: new Date().toISOString() },
        }).findOne()
        if (!dbContest) throw catchError("Contest not found!", 404)
        if (isAfter(new Date(), new Date(dbContest.endDate))) {
            throw catchError("Contest has ended!", 400)
        }
        const member = await new MemberService({
            user: String(req.user._id),
            contest: String(dbContest?._id),
        }).findOne()
        if (member) throw catchError("You already joined the contest")

        const session = await db.startSession()
        await session.withTransaction(async () => {
            if (Number(dbContest.amount)) {
                await debitWallet({
                    userId: String(req.user._id),
                    session,
                    amount: Number(dbContest.amount),
                    isWithdrawal: false,
                    pendingTransaction: false,
                    transactionMeta: { ...req.body, action: "Join contest" },
                })
            }
            await new MemberService({}).create(
                {
                    contest: String(dbContest?._id),
                    user: String(req.user._id),
                    status: "approved" as any,
                    type: "member",
                },
                session
            )
        })

        return res
            .status(201)
            .json(success("Contest joined successfully", {}, {}))
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
        const [contests, error] = await tryPromise(
            new ContestService({}).findAll(
                composeFilter(req),
                Number(page),
                Number(limit),
                [
                    {
                        path: "user",
                        select: "firstName lastName avatar username",
                    },
                    { path: "competition", select: "name logo code" },
                ],
                "-invitationCode"
            )
        )

        if (error) throw catchError("Errors retrieving users", 400)
        const contestIds = contests?.docs.map(contest => contest._id)
        const members = await new MemberService({}).findAll({
            contest: { $in: contestIds },
        })
        const data = contests?.docs?.map(contest => {
            const hasMember = members.docs.find(
                member => String(member.user) === String(req.user._id)
            )

            return {
                ...contest,
                isCreator:
                // @ts-ignore
                    String(contest.user?._id) === String(req.user._id) ||
                    !!hasMember,
            }
        })
        const result = { ...contests, docs: data }

        return res.status(200).json(success("Contest retrieved", result))
    } catch (error) {
        next(error)
    }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [contest, error] = await tryPromise(
            new ContestService({ _id: req.params._id }).findOne()
        )

        if (error) throw catchError("Errors retrieving users", 400)

        return res.status(200).json(success("Contest retrieved", contest))
    } catch (error) {
        next(error)
    }
}
