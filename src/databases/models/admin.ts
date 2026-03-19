/** @format */

import { Schema } from "mongoose"
import { mongoosePagination, Pagination } from "mongoose-paginate-ts"

import { db } from "../connection"
import { IAdmin } from "../../types"


const AdminSchema: Schema = new Schema<IAdmin>(
    {
        firstName: { type: "String", },
        lastName: { type: "String", },
        email: { type: "String", required: true },
        password: { type: "String", required: true },
        isActive: { type: "Boolean", default: true },        
        deletedAt: { type: "String", default: null },
    },
    {
        autoIndex: true,
        versionKey: false,
        collection: "admins",
    }
)

AdminSchema.set("timestamps", true)
AdminSchema.plugin(mongoosePagination)
AdminSchema.index({ "email": 1, phoneNumber: 1 })

const AdminModel = db.model<IAdmin, Pagination<IAdmin>>(
    "Admin",
    // @ts-ignore
    AdminSchema
)

export default AdminModel
