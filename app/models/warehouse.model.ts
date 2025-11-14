import { IWarehouse } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const WarehouseSchema = new Schema<IWarehouse>(
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
        media: {
            type: [String],
            default: []
        },
        main_person_name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true,
        },
        email: {
            type: String,
            required: true,
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

interface IWarehouseModel extends Model<IWarehouse> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>,
    scan: (
        companyId: string,
        warehouseId: string
    ) => Promise<any[]>
};

WarehouseSchema.statics.get = async function (
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
                foreignField: "warehouse",
                as: "product",
            }
        },
        {
            $addFields: {
                quantityOfProducts: { $size: "$product" }
            }
        },
        {
            $lookup: {
                from: "zone",
                localField: "_id",
                foreignField: "warehouse",
                as: "zone",
            }
        },
        {
            $addFields: {
                numberOfZones: { $size: "$zone" }
            }
        },
    ]

    const result = await this.aggregate(pipeline);

    return result || [];
}


WarehouseSchema.statics.scan = async function (
    companyId: string,
    warehouseId: string
) {
    const pipeline = [
        {
            $match: {
                _id: new Types.ObjectId(warehouseId),
                "company.id": new Types.ObjectId(companyId),
            }
        },
        {
            $lookup: {
                from: "zone",
                localField: "_id",
                foreignField: "warehouse.id",
                as: "zone",
            }
        },
        {
            $addFields: {
                numberOfZones: { $size: "$zone" }
            }
        },
        {
            $lookup: {
                from: "product",
                localField: "_id",
                foreignField: "warehouse.id",
                as: "product",
            }
        },
        {
            $addFields: {
                quantityOfProducts: { $size: "$product" }
            }
        },
        {
            $project: {
                _id: 0,
                company: 0
            }
        }
    ]

    const result = await this.aggregate(pipeline);

    return result || [];
}

export const Warehouse = mongoose.model<IWarehouse, IWarehouseModel>("Warehouse", WarehouseSchema);