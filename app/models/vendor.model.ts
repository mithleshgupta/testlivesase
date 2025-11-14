import { IVendor } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const VendorSchema = new Schema<IVendor>(
    {
        company: {
            type: Types.ObjectId,
            ref: "Company",
            required: true
        },
        name: {
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
        }
    },
    {
        timestamps: true
    }
);

interface IVendorModel extends Model<IVendor> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>,

};

VendorSchema.statics.get = async function (
    matchConditions: Record<string, any> = {},
    filters: any[] = []
) {
    const pipeline = [
        {
            $match: matchConditions
        },
        ...filters,
        {
            $lookup: {
                from: "productInfo",
                localField: "_id",
                foreignField: "vendor",
                as: "productInfo",
            }
        },
        {
            $addFields: {
                quantityOfProductsInfo: { $size: "$productInfo" }
            }
        }
    ]

    const result = await this.aggregate(pipeline);

    return result || [];
}

export const Vendor = mongoose.model<IVendor, IVendorModel>("Vendor", VendorSchema);