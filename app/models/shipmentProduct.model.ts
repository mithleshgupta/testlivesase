import { IShipmentProduct } from "../utils/types/interfaces";
import mongoose, { Model, Schema, Types } from "mongoose";

const ShipmentProductSchema = new Schema<IShipmentProduct>(
    {
        shipment: {
            type: Types.ObjectId,
            ref: "Shipment",
            required: true
        },
        epcNumber: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

interface IShipmentProductModel extends Model<IShipmentProduct> {
    addProducts: (
        shipmentId: string,
        epcNumbers: any[]
    ) => Promise<void>;
};

ShipmentProductSchema.statics.addProducts = async function (
    shipmentId: string,
    epcNumbers: any[]
) {
     
}
export const ShipmentProduct = mongoose.model<IShipmentProduct, IShipmentProductModel>("ShipmentProduct", ShipmentProductSchema);