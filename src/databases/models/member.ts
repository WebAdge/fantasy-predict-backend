/** @format */

import { Schema } from "mongoose"
import { mongoosePagination, Pagination } from "mongoose-paginate-ts"

import { db } from "../connection"
import { IMember } from "../../types"

const MemberSchema: Schema = new Schema<IMember>(
    {
        user: { type: "String", required: true, ref: "User" },
        contest: { type: "String", required: true, ref: "Contest" },
        status: { type: "String", default: 'approved' },
        type: { type: "String", default: 'member' },
        deletedAt: { type: "String", default: null },
    },
    {
        autoIndex: true,
        versionKey: false,
        collection: "members",
    }
)

MemberSchema.set("timestamps", true)
MemberSchema.plugin(mongoosePagination)
MemberSchema.index({ "user": 1, competition: 1, title: 1 })

const MemberModel = db.model<IMember, Pagination<IMember>>(
    "Member",
    // @ts-ignore
    MemberSchema
)

export default MemberModel
