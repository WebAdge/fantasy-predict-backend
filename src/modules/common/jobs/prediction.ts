/** @format */

import MatchService from "../../v1/matches/service"
import FootballData from "../../thirdpartyApi/football"
import PredictionService from "../../v1/predictions/service"
import { composePredictionPoints } from "../../v1/predictions/helper"
import { subMinutes } from "date-fns"
import { db } from "../../../databases/connection"

export const processPrediction = async () => {
    try {
        // $sample picks the 10 matches randomly; the sort direction is then
        // flipped on a coin toss each run so the batch is worked oldest-first
        // one time and newest-first the next, instead of always one way.
        const sortDirection = Math.random() < 0.5 ? 1 : -1

        const matches = await new MatchService({}).aggregate([
            {
                $match: {
                    "homeTeam.score": null,
                    "awayTeam.score": null,
                    date: { $lt: subMinutes(new Date(), 90) },
                    deletedAt: null,
                },
            },
            { $sample: { size: 10 } },
            { $sort: { date: sortDirection } },
        ])

        for (const match of matches ?? []) {
            try {
                const result = await new FootballData().getMatch(match.matchId)
                console.log(result)

                if (result.status !== "FINISHED") continue

                // get all prediction for this match
                const predictions = await new PredictionService({}).findAll({
                    match: match._id,
                    $or: [
                        { status: "pending" },
                        { status: { $exists: false } },
                    ],
                })

                const session = await db.startSession()
                await session.withTransaction(async () => {
                    if (predictions.docs.length) {
                        const patientWrites = composePredictionPoints(
                            predictions.docs,
                            result.score.fullTime.home,
                            result.score.fullTime.away
                        )
                        await new PredictionService({}).bulkWrite(
                            patientWrites,
                            session
                        )
                    }
                    await new MatchService({
                        _id: String(match._id),
                    }).update(
                        {
                            homeTeam: {
                                ...match.homeTeam,
                                score: result.score.fullTime.home,
                            },
                            awayTeam: {
                                ...match.awayTeam,
                                score: result.score.fullTime.away,
                            },
                            status: result.status?.toLocaleLowerCase(),
                        },
                        session
                    )
                })
                await session.endSession()
            } catch (error) {
                console.log("Error updating prediction point for match", match._id)
            }
        }
    } catch (error) {
        console.log("Error updating prediction point")
    }
}
