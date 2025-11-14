import { IZone } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const ZoneSchema = new Schema<IZone>(
    {
        company: {
            type: Types.ObjectId,
            ref: "Company",
            required: true
        },
        warehouse: {
            type: Types.ObjectId,
            ref: "Warehouse",
            required: true
        }
    },
    {
        timestamps: true
    }
);

interface IZoneModel extends Model<IZone> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>
};

ZoneSchema.statics.get = async function (
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
                foreignField: "zone",
                as: "product",
            }
        },
        {
            $addFields: {
                quantityOfProducts: { $size: "$product" }
            }
        },
    ];

    const result = await this.aggregate(pipeline);

    return result || [];
}

export const Zone = mongoose.model<IZone, IZoneModel>("Zone", ZoneSchema);