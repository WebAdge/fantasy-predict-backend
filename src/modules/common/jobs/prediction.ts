/** @format */

import MatchService from "../../v1/matches/service"
import FootballData from "../../thirdpartyApi/football"
import PredictionService from "../../v1/predictions/service"
import { composePredictionPoints } from "../../v1/predictions/helper"
import { subMinutes } from "date-fns"
import { db } from "../../../databases/connection"

export const processPrediction = async () => {
    try {
        const match = await new MatchService({
            "homeTeam.score": null,
            "awayTeam.score": null,
            date: { $lt: subMinutes(new Date(), 90) },
        }).findOne()

        if (match) {
            const result = await new FootballData().getMatch(match.matchId)
            console.log(result)

            if (result.status === "FINISHED") {
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
            }
        }
    } catch (error) {
        console.log("Error updating prediction point")
    }
}
