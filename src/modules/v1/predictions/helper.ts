/** @format */

import { endOfDay, startOfDay } from "date-fns"
import { Types } from "mongoose"
import { IPrediction } from "../../../types";

export const leaderboardPipeline = (
    competition: string,
    userIds = [] as string[],
    fromDate: string,
    toDate: string,
    pool: string
) => [
    {
        $match: {
            ...(pool && {
                _id: { $in: userIds.map(userId => new Types.ObjectId(userId)) },
            }),
        },
    },
    {
        $limit: 50,
    },
    {
        $lookup: {
            let: {
                userId: { $toString: "$_id" },
            },
            from: "predictions",
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$user", "$$userId"] },
                                {
                                    ...(competition && {
                                        $eq: ["$competition", competition],
                                    }),
                                    ...(fromDate &&
                                        toDate && {
                                            $and: [
                                                {
                                                    $gte: [
                                                        "$createdAt",
                                                        startOfDay(
                                                            new Date(fromDate)
                                                        ),
                                                    ],
                                                },
                                                {
                                                    $gte: [
                                                        "$createdAt",
                                                        endOfDay(
                                                            new Date(toDate)
                                                        ),
                                                    ],
                                                },
                                            ],
                                        }),
                                },
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: "$user",
                        totalPoints: { $sum: "$point" },
                    },
                },
            ],
            as: "predictions",
        },
    },
    {
        $addFields: {
            predictions: {
                $ifNull: [
                    { $arrayElemAt: ["$predictions", 0] },
                    { _id: null, totalPoints: 0 },
                ],
            },
        },
    },
    {
        $sort: {
            "predictions.totalPoints": -1,
        },
    },
]

/**
 * Point system
 * Exact score = 3 points
 * Predicted the right team to win both not exact score = 2 points
 * Correct result but not exact score = 1 point
 * Wrong prediction = 0 points
 * @param homeScore 
 * @param awayScore 
 * @param outcome 
 * @returns 
 */
export const calculatePredictionPoint = (
    homeScore: number,
    awayScore: number,
    outcome: string // eg. 1-0
) => {
    let point = 0;

    const predictedHomeOutcome = outcome.split('-')[0]
    const predictedAwayOutcome = outcome.split('-')[1]

    const predictedDraw = Number(predictedHomeOutcome) === Number(predictedAwayOutcome);
    const resultedDraw = Number(homeScore) === Number(awayScore);

    const predictedHomeWin = Number(predictedHomeOutcome) > Number(predictedAwayOutcome);
    const predictedAwayWin = Number(predictedHomeOutcome) < Number(predictedAwayOutcome);
    const resultedHomeWin = Number(homeScore) > Number(awayScore);
    const resultedAwayWin = Number(homeScore) < Number(awayScore);


    if (Number(predictedHomeOutcome) === Number(homeScore) && Number(predictedAwayOutcome) === Number(awayScore)) {
        point = 3
    } else if (predictedHomeWin && resultedHomeWin) {
        point = 2
    } else if (predictedAwayWin && resultedAwayWin) {
        point = 2;
    } else if (predictedDraw && resultedDraw) {
        point = 1
    } else {
        point = 0
    }

    return point
}

console.log(calculatePredictionPoint(1,1,'1-1'));

export const composePredictionPoints = (predictions: IPrediction[], homeScore: number, awayScore: number) => {
    return predictions.map(({ outcome, _id }) => ({
        updateOne: {
            filter: {
                _id
            },
            update: {
                $set: { status: "completed", point: calculatePredictionPoint(homeScore, awayScore, outcome) }
            }
        }
    }));
};