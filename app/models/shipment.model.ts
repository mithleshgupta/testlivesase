import { IShipment } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const ShipmentSchema = new Schema<IShipment>(
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
        },
        destinationWarehouse: {
            type: Types.ObjectId,
            ref: "Warehouse",
            required: true
        },
        status: {
            type: String,
            enum: ["ready to ship", "outbound", "inbound", "completed"],
            required: true,
            default: "ready to ship"
        },
        schedule: {
            type: Date,
            default: () => Date.now()
        }
    },
    {
        timestamps: true
    }
);

interface IShipmentModel extends Model<IShipment> {
    get: (
        matchConditions: Record<string, any>,
        filters: any[]
    ) => Promise<any[]>,

};

ShipmentSchema.statics.get = async function (
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
                from: "shipmentProduct",
                localField: "_id",
                foreignField: "shipment",
                as: "prodcuts",
            }
        },
        {
            $addFields: {
                quantityOfProducts: { $size: "$prodcuts" }
            }
        }
    ]

    const result = await this.aggregate(pipeline);

    return result || [];
}

export const Shipment = mongoose.model<IShipment, IShipmentModel>("Shipment", ShipmentSchema);