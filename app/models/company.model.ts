import { ICompany } from "../utils/types/interfaces";
import mongoose, { Model, Schema, PipelineStage, Types } from "mongoose";

const CompanySchema = new Schema<ICompany>(
    {
        brand_name: {
            type: String,
            required: true
        },
        organization: {
            type: String,
            required: true
        },
        gstin: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        address: {
            type: String,
            required: true
        },
        admin: {
            type: Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true
    }
);

interface ICompanyModel extends Model<ICompany> { };

CompanySchema.statics.get = async function (matchConditions) {

    const pipeline: PipelineStage[] = [];

    const result = await this.aggregate(pipeline);

    return result;
}

export const Company = mongoose.model<ICompany, ICompanyModel>("Company", CompanySchema);