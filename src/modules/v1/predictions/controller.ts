/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import PredictionService from "./service"
import MatchService from "../matches/service"
import { leaderboardPipeline } from "./helper"
import UserService from "../users/service"
import PoolMemberService from "../members/service"
import { isAfter } from "date-fns"

export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { outcome, pool, match, competition } = req.body
    try {
        const [dbMatch, dbPrediction] = await Promise.all([
            new MatchService({ _id: match }).findOne(),
            new PredictionService({ match, pool }).findOne(),
        ])

        if (!dbMatch) throw catchError("Match does not exists", 400)
        if (dbPrediction?.point) throw catchError("Match already finished", 400)

        // check if data has passed
        if (isAfter(new Date(), new Date(dbMatch.date)))
            throw catchError("Match is currently in progress", 400)

        if (dbPrediction) {
            await new PredictionService({ _id: dbPrediction._id }).update({
                outcome,
            })
        } else {
            await new PredictionService({}).create({
                user: String(req.user._id),
                pool,
                match,
                outcome,
                point: 0,
                competition,
                status: "pending",
            })
        }

        return res
            .status(200)
            .json(success("Prediction added successfully", {}))
    } catch (error) {
        next(error)
    }
}

export const leaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { competition, fromDate, toDate, pool } = req.query
    try {
        const [members, error] = await tryPromise(
            new PoolMemberService({}).findAll({
                pool,
                status: "approved",
            })
        )

        if (error) throw catchError("Error processing request", 400)
        const memberIds = members?.docs.map(doc => doc.user) || []
        console.log({ memberIds })

        const leaderboard = await new UserService({}).aggregate(
            // @ts-ignore
            leaderboardPipeline(
                competition as string,
                memberIds,
                fromDate as string,
                toDate as string,
                pool as string
            )
        )

        return res
            .status(200)
            .json(success("Leaderboard retrieved", leaderboard))
    } catch (error) {
        next(error)
    }
}

export const applicationInReview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { competition, fromDate, toDate, poolId } = req.query
    try {
        const [members, error] = await tryPromise(
            new PoolMemberService({}).findAll({
                pool: poolId,
                status: "pending",
            })
        )

        if (error) throw catchError("Error processing request", 400)
        const memberIds = members?.docs.map(doc => doc.user)

        const leaderboard = await new UserService({}).aggregate(
            // @ts-ignore
            leaderboardPipeline(
                competition as string,
                memberIds,
                fromDate as string,
                toDate as string
            )
        )

        return res
            .status(200)
            .json(success("Leaderboard retrieved", leaderboard))
    } catch (error) {
        next(error)
    }
}

export const competitionLeaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { competition } = req.query
    try {
        const personalLeaderboard = await new PredictionService(
            {}
        ).getPredictionLeaderboard(competition as string, String(req.user._id))
        const result = await new PredictionService({}).getPredictionLeaderboard(
            competition as string
        )

        return res
            .status(200)
            .json(
                success("Result retrieved", {
                    board: result,
                    personalRank: personalLeaderboard,
                })
            )
    } catch (error) {
        next(error)
    }
}
