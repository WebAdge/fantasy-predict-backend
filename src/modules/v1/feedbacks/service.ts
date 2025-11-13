/** @format */

import { IFeedback } from "../../../types"
import { FeedbackModel } from "../../../databases"
import BaseRepository from "../../common/repositories/BaseRepository"
import { FilterQuery } from "mongoose"

class FeedbackService extends BaseRepository<IFeedback> {
    constructor(params: Partial<IFeedback> | FilterQuery<IFeedback>) {
        super(FeedbackModel, params)
    }
}

export default FeedbackService
