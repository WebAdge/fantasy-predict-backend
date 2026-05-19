/** @format */

import { IPrediction } from "../../../types"
import { PredictionModel } from "../../../databases"
import BaseRepository from "../../common/repositories/BaseRepository"
import { FilterQuery } from "mongoose"

class PredictionService extends BaseRepository<IPrediction> {
    constructor(params: Partial<IPrediction> | FilterQuery<IPrediction>) {
        super(PredictionModel, params)
    }

    public async getPredictionLeaderboard(competition: string, user?: string) {
        return this.model.aggregate([
            {
                $match: {
                    competition,
                    ...(user && { user })
                },
            },
            {
                $group: {
                    _id: "$user",
                    Cls: {
                        $sum: { $cond: [{ $eq: ["$point", 3] }, 1, 0] },
                    },
                    Exact: {
                        $sum: { $cond: [{ $eq: ["$point", 2] }, 1, 0] },
                    },
                    Slam: {
                        $sum: { $cond: [{ $eq: ["$point", 1] }, 1, 0] },
                    },
                    Total: {
                        $sum: "$point",
                    },
                },
            },
            {
                $sort: { Total: -1 },
            },
            {
                $setWindowFields: {
                    sortBy: { Total: -1 },
                    output: {
                        rank: { $rank: {} },
                    },
                },
            },
            {
                $addFields: {
                    userObjId: {
                        $convert: {
                            input: "$_id",
                            to: "objectId",
                            onError: null,
                            onNull: null,
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userObjId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                email: 1,
                                username: 1,
                                firstName: 1,
                                lastName: 1,
                            },
                        },
                    ],
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    user: 1,
                    Cls: 1,
                    Exact: 1,
                    Slam: 1,
                    Total: 1,
                    rank: 1,
                },
            },
        ])
    }
}

export default PredictionService
