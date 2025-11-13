/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import MemberService from "./service"
import { composeFilter } from "./helper"

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page, limit } = req.query
    try {
        const [users, error] = await tryPromise(
            new MemberService({}).findAll(
                composeFilter(req),
                Number(page),
                Number(limit),
                [{ path: "user", select: "firstName lastName email" }]
            )
        )

        if (error) throw catchError("Errors retrieving users", 400)

        return res.status(200).json(success("Users retrieved", users))
    } catch (error) {
        next(error)
    }
}

export const getCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { pool } = req.query
    try {
        const [pending, declined, approved] = await Promise.all([
            new MemberService({ pool, status: "pending" }).count(),
            new MemberService({ pool, status: "declined" }).count(),
            new MemberService({ pool, status: "approved" }).count(),
        ])

        return res
            .status(200)
            .json(
                success("Members count retrieved", {
                    approved,
                    declined,
                    pending,
                })
            )
    } catch (error) {
        next(error)
    }
}
