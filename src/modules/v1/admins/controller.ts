/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import { composeFilter } from "./helper"
import AdminService from "./service"
import { decrytData, encryptData } from "../../common/hashings"
import { addHours } from "date-fns"
import UserService from "../users/service"
import PredictionService from "../predictions/service"
import WithdrawalService from "../withdrawals/service"
import WalletService from "../wallets/service"
import PoolService from "../pools/service"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [, crtError] = await tryPromise(
            new AdminService({}).create({
                ...req.body,
                isActive: true,
                email: req.body.email.toLowerCase(),
                password: encryptData(req.body.password),
            })
        )

        if (crtError) throw catchError("An error occurred! Try again", 400)

        return res.status(201).json(success("Account created successfully", {}))
    } catch (error) {
        next(error)
    }
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body
    try {
        const [user, error] = await tryPromise(
            new AdminService({
                email: email.toLowerCase(),
                isActive: true,
            }).findOne()
        )

        if (error) throw catchError("Error processing request", 400)

        if (!user) throw catchError("Email/Password is incorrect", 404)
        console.log(decrytData(user.password), password, user.password)
        if (decrytData(user.password) !== password)
            throw catchError("Email/Password is incorrect", 400)

        const token = encryptData(
            JSON.stringify({ _id: user._id, exp: addHours(new Date(), 48), type: 'admin' })
        )

        return res.status(200).json(
            success(
                "Logged In successfully",
                {
                    email,
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
            new AdminService({ _id: req.params.id || req.admin._id }).update(
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
    const user = req.admin
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
    const user = req.admin
    try {
        await new AdminService({ _id: user._id }).update({ isActive: false })

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
            new AdminService({}).findAll(
                composeFilter(req),
                Number(page),
                Number(limit)
            )
        )

        if (error) throw catchError("Errors retrieving users", 400)

        return res.status(200).json(success("Admins retrieved", users))
    } catch (error) {
        next(error)
    }
}

export const dashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [
            totalUser,
            totalPrediction,
            totalPools,
            users,
            withdrawals,
            wallet,
        ] = await Promise.all([
            new UserService({}).count(),
            new PredictionService({}).count(),
            new PoolService({}).count(),
            new UserService({}).findAll({}, 1, 10),
            new WithdrawalService({}).findAll({}, 1, 10),
            new WalletService({}).aggregate([
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: "$balance" },
                    },
                },
            ]),
        ])

        const result = {
            totalUser,
            totalPrediction,
            totalPools,
            totalWallet: wallet,
            recentWithdrawals: withdrawals?.docs,
            recentUsers: users?.docs,
        }
        return res
            .status(200)
            .json(success("Admins dashboard retrieved", result))
    } catch (error) {
        next(error)
    }
}
