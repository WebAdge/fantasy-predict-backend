/** @format */

import { Schema } from "mongoose"
import { mongoosePagination, Pagination } from "mongoose-paginate-ts"

import { db } from "../connection"
import { IContest } from "../../types"

const WinSchema: Schema = new Schema({
    first: { type: "Number" },
    second: { type: "Number" },
    third: { type: "Number" },
})

const ContestSchema: Schema = new Schema<IContest>(
    {
        user: { type: "String", required: true, ref: "User" },
        title: { type: "String", required: true, unique: true },
        description: { type: "String" },
        competition: { type: "String", required: true, ref: "Competition" },
        startDate: { type: "String", required: true },
        endDate: { type: "String", required: true },
        amount: { type: "Number", default: 0 },
        type: { type: "String", default: "public" },
        invitationCode: { type: "String" },
        totalUsersJoined: { type: "Number", default: 0 },
        winType: WinSchema,
        deletedAt: { type: "String", default: null },
    },
    {
        autoIndex: true,
        versionKey: false,
        collection: "contests",
    }
)

ContestSchema.set("timestamps", true)
ContestSchema.plugin(mongoosePagination)
ContestSchema.index({ user: 1, competition: 1, title: 1 })

const ContestModel = db.model<IContest, Pagination<IContest>>(
    "Contest",
    // @ts-ignore
    ContestSchema
)

export default ContestModel
