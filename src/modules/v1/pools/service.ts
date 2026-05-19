/** @format */

import { IPool } from "../../../types"
import { PoolModel } from "../../../databases"
import BaseRepository from "../../common/repositories/BaseRepository"
import { FilterQuery } from "mongoose"

class PoolService extends BaseRepository<IPool> {
    constructor(params: Partial<IPool> | FilterQuery<IPool>) {
        super(PoolModel, params)
    }

    public async poolLeaderboard(userId: string) {
        return this.model.aggregate([
            {
                $addFields: {
                    competitionObjId: {
                        $cond: [
                            { $eq: [{ $type: "$competition" }, "string"] },
                            { $toObjectId: "$competition" },
                            "$competition",
                        ],
                    },
                },
            },
            {
                $sort: {
                    createdAt: 1,
                },
            },
            {
                $lookup: {
                    from: "competitions",
                    localField: "competitionObjId",
                    foreignField: "_id",
                    as: "competition",
                },
            },
            {
                $unwind: {
                    path: "$competition",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "poolMembers",
                    let: { poolId: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pool", "$$poolId"] },
                                        { $eq: ["$user", userId] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: "membership",
                },
            },

            // 🔹 Computed flags
            {
                $addFields: {
                    isCreator: {
                        $eq: ["$createdBy", userId],
                    },
                    isMember: {
                        $gt: [{ $size: "$membership" }, 0],
                    },
                },
            },

            {
                $match: {
                    $or: [
                        { privacy: "public" },
                        { isMember: true },
                        { isCreator: true },
                    ],
                },
            },
            {
                $project: {
                    membership: 0,
                    competitionObjId: 0,
                },
            },
        ])
    }
}

export default PoolService
