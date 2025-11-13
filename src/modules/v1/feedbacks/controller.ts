/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import FeedbackService from "./service"

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [feedbacks, error] = await tryPromise(
            new FeedbackService({}).findAll({}, 1, 20)
        )

        if (error) throw catchError("Error processing request")

        return res
            .status(200)
            .json(success("Feedback retrieved successfully", feedbacks))
    } catch (error) {
        next(error)
    }
}

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [feedback, error] = await tryPromise(
            new FeedbackService({}).create({ ...req.body, user: String(req.user._id) })
        )

        if (error) throw catchError("Error processing request")

        return res
            .status(200)
            .json(success("Feedback retrieved successfully", feedback))
    } catch (error) {
        next(error)
    }
}

