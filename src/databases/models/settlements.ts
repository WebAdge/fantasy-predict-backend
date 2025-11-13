/** @format */

import { Schema } from "mongoose"
import { mongoosePagination, Pagination } from "mongoose-paginate-ts"

import { db } from "../connection"
import { ISettlement } from "../../types"

const SettlementSchema: Schema = new Schema<ISettlement>(
    {
        type: { type: "String", },
        meta: { type: "Map" },
        status: { type: "String", required: true, default: "pending" },
        deletedAt: { type: "String", default: null },
    },
    {
        autoIndex: true,
        versionKey: false,
        collection: "settlements",
    }
)

SettlementSchema.set("timestamps", true)
SettlementSchema.plugin(mongoosePagination)
SettlementSchema.index({ user: 1, pool: 1, match: 1 })

const SettlementModel = db.model<ISettlement, Pagination<ISettlement>>(
    "Settlement",
    // @ts-ignore
    SettlementSchema
)

export default SettlementModel
