/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import { composeFilter } from "./helper"
import UserService from "./service"
import { decrytData, encryptData } from "../../common/hashings"
import { addHours } from "date-fns"
import { randomInt } from "crypto"
import { db } from "../../../databases/connection"
import { IUser } from "../../../types"
import Email from "../../thirdpartyApi/zeptomail"
import { verifyAccountMail } from "../../mails/verifyAccount"
import { joinWorldCupLeaderboard } from "../pool-members/helper"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const otp = randomInt(100000, 999999)
        const session = await db.startSession()
        let result = null as IUser | null
        await session.withTransaction(async () => {
            const [user, crtError] = await tryPromise(
                new UserService({}).create({
                    ...req.body,
                    email: req.body.email.toLowerCase(),
                    otp,
                    password: encryptData(req.body.password),
                })
            )

            if (user) {
                result = user
                await joinWorldCupLeaderboard(String(user._id)).catch(
                    () => null
                )
            }

            if (crtError) throw catchError("An error occurred! Try again", 400)
        })

        if (result) {
            new Email().SendEmail(
                result,
                "Your verification code",
                verifyAccountMail(req.body.firstName, otp.toString())
            )
        }

        return res.status(201).json(
            success(
                "Account created successfully",
                {
                    // @ts-ignore
                    email: result?.email,
                },
                {}
            )
        )
    } catch (error) {
        next(error)
    }
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { to, password } = req.body
    try {
        const [user, error] = await tryPromise(
            new UserService({
                $or: [{ phoneNumber: to }, { email: to.toLowerCase() }],
                isActive: true,
            }).findOne()
        )

        if (error) throw catchError("Error processing request", 400)

        if (!user) throw catchError("Email/Password is incorrect", 404)
        console.log(decrytData(user.password), password, user.password)
        if (decrytData(user.password) !== password)
            throw catchError("Email/Password is incorrect", 400)

        if (!user.verifiedAt) {
            const otp = randomInt(100000, 999999)
            await new UserService({ _id: user._id }).update({
                otp: String(otp),
            })
            new Email().SendEmail(
                user,
                "Your verification code",
                verifyAccountMail(req.body.firstName, otp.toString())
            )
        }

        const token = encryptData(
            JSON.stringify({ _id: user._id, exp: addHours(new Date(), 48) })
        )

        return res.status(200).json(
            success(
                "Logged In successfully",
                {
                    verificationStatus: !!user.verifiedAt,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    _id: user._id,
                },
                { token }
            )
        )
    } catch (error) {
        next(error)
    }
}

export const update = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [user, error] = await tryPromise(
            new UserService({ _id: req.params.id || req.user._id }).update(
                req.body
            )
        )

        if (error) throw catchError("Error processing request", 400)

        const token = encryptData(
            JSON.stringify({ _id: user?._id, exp: addHours(new Date(), 48) })
        )

        return res
            .status(200)
            .json(success("Account updated successfully", { token }))
    } catch (error) {
        next(error)
    }
}

export const profile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user
    try {
        const excludeFields = ["password", "otp", "promo", "nin"]
        const result = Object.keys(user).reduce((acc, curr) => {
            if (!excludeFields.includes(curr)) {
                // @ts-ignore
                acc[curr] = user[curr]
            }
            return acc
        }, {})

        return res
            .status(200)
            .json(success("Account retrieved successfully", result))
    } catch (error) {
        next(error)
    }
}

export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user
    try {
        await new UserService({ _id: user._id }).update({ isActive: false })

        return res.status(200).json(success("Account deleted successfully", {}))
    } catch (error) {
        next(error)
    }
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page, limit } = req.query
    try {
        const [users, error] = await tryPromise(
            new UserService({}).findAll(
                composeFilter(req),
                Number(page),
                Number(limit)
            )
        )

        if (error) throw catchError("Errors retrieving users", 400)

        return res.status(200).json(success("Users retrieved", users))
    } catch (error) {
        next(error)
    }
}

export const userCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const totalUsers = await new UserService({}).count()

        return res
            .status(200)
            .json(success("Users count retrieved", { totalUsers }))
    } catch (error) {
        next(error)
    }
}
