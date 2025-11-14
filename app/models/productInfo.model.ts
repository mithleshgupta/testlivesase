import { IProductInfo } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const ProductInfoSchema = new Schema<IProductInfo>(
    {
        company: {
            type: Types.ObjectId,
            ref: "Company",
            required: true
        },
        vendor: {
            type: Types.ObjectId,
            ref: "Vendor",
            default: null
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        sku: {
            type: String,
            required: true,
        },
        barcode: {
            type: String,
            required: true,
        },
        barcode_upload: {
            type: String,
            default: null
        },
        media: {
            type: [String],
            default: []
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        cost_price: {
            type: Number,
            required: true,
            default: 0
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        low_quantity_trigger: {
            type: Number,
            required: true,
            default: 0
        },
        tax_percentage: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

interface IProductInfoModel extends Model<IProductInfo> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>
};

ProductInfoSchema.statics.get = async function (
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
                from: "product",
                localField: "_id",
                foreignField: "productInfo",
                as: "product",
            }
        },
        {
            $addFields: {
                productQuantity: { $size: "$product" }
            }
        },
    ];

    const result = await this.aggregate(pipeline);

    return result || [];
}

export const ProductInfo = mongoose.model<IProductInfo, IProductInfoModel>("ProductInfo", ProductInfoSchema);