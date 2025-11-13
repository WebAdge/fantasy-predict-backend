/** @format */

import { Schema } from "mongoose"
import { mongoosePagination, Pagination } from "mongoose-paginate-ts"

import { db } from "../connection"
import { IFeedback } from "../../types"


const FeedbackSchema: Schema = new Schema<IFeedback>(
    {
        user: { type: "String", required: true, ref: "User" },
        message: { type: "String", required: true },
        deletedAt: { type: "String", default: null },
    },
    {
        autoIndex: true,
        versionKey: false,
        collection: "feedbacks",
    }
)

FeedbackSchema.set("timestamps", true)
FeedbackSchema.plugin(mongoosePagination)
FeedbackSchema.index({ "user": 1 })

const FeedbackModel = db.model<IFeedback, Pagination<IFeedback>>(
    "Feedback",
    // @ts-ignore
    FeedbackSchema
)

export default FeedbackModel
