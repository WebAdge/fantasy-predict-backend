/** @format */

import { IAdmin } from "../../../types"
import { AdminModel } from "../../../databases"
import BaseRepository from "../../common/repositories/BaseRepository"
import { FilterQuery } from "mongoose"

class AdminService extends BaseRepository<IAdmin> {
    constructor(params: Partial<IAdmin> | FilterQuery<IAdmin>) {
        super(AdminModel, params)
    }
}

export default AdminService
