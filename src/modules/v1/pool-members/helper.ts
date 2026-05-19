/** @format */

import { Request } from "express"
import PoolMemberService from "./service"
import PoolService from "../pools/service"

export const composeFilter = (req: Request) => {
    const { user, poolId, status } = req.query
    let filter = { pool: poolId } as any

    if (user) filter = { ...filter, user: String(user) }
    if (status) filter = { ...filter, status }

    console.log({ filter })

    return filter
}

export const joinWorldCupLeaderboard = async (userId: string) => {
    const poolId = "69ca154762e13433c8869335"
    const pool = await new PoolService({ _id: poolId }).findOne()
    if (!pool) return
    new PoolMemberService({}).create({
        pool: poolId,
        user: String(userId),
        totalAmountSpent: 0,
        gameWeeksParticipated: [],
        status: "approved",
        type: "player",
    })

    await new PoolService({ _id: pool }).update({
        totalMembers: Number(pool.totalMembers) + 1,
    })
}
