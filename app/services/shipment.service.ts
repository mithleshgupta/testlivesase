import z from 'zod';
import { join } from 'path';
import { Types } from 'mongoose';

import AppError from '../utils/AppError';
import logger from '../utils/logger';

import {
    ShipmentProductTypeSchema,
    ShipmentTypeSchema
} from '../utils/types/typeObjects';
import { validate } from '../utils/validator';
import {
    FileType,
    IdType
} from '../utils/types';
import { Reader } from '../utils/csv';

import { Shipment } from '../models/shipment.model';
import { ShipmentProduct } from '../models/shipmentProduct.model';
import { Product } from '../models/product.model';
import { Warehouse } from '../models/warehouse.model';
import { SORTS, UPLOAD_DIR } from '../utils/constants';

export default class ShipmentService {
    private static shipmentShape = ShipmentTypeSchema.shape;
    private static shipmentProductShape = ShipmentProductTypeSchema.shape;

    static createShipment = async (
        body: {
            companyId: string,
            warehouseId: string,
            destinationWarehouseId: string,
            schedule: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType,
                    destinationWarehouseId: IdType,
                    schedule: z.date().optional(),
                }),
                body
            );
            const { companyId, destinationWarehouseId } = body;

            const destinationExist = Warehouse.exists({
                _id: new Types.ObjectId(destinationWarehouseId),
                company: new Types.ObjectId(companyId)
            });

            if (!destinationExist) {
                throw new AppError("Invalid destination warehouse", 401);
            }

            await Shipment.create({
                company: new Types.ObjectId(companyId),
                warehouse: new Types.ObjectId(body.warehouseId),
                destinationWarehouse: new Types.ObjectId(destinationWarehouseId),
                schedule: body.schedule,
            });

            logger.info(`Shipment created`);

            return {
                success: true,
                message: "Shipment created successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to create shipment. Please try again.",
                `Failed to create shipment for Company: ${body.companyId}, Warehouse: ${body.warehouseId}`
            );
        }
    }

    static addProductstoShipment = async (
        body: {
            companyId: string,
            shipmentId: string,
            file: Express.Multer.File | undefined,
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    shipmentId: IdType,
                    file: FileType.optional(),
                }),
                body
            );

            if (!body.file) {
                throw new AppError("No file uploaded", 401);
            }

            const { shipmentId } = body;

            const exist = Shipment.findOne({
                _id: new Types.ObjectId(shipmentId),
                company: new Types.ObjectId(body.companyId)
            });

            if (!exist) {
                throw new AppError("Shipment doesn't exist", 401);
            }

            const filePath = body.file.path;

            const data = await Reader.fromFiletoObject(
                filePath,
                "epcNumber",
                {
                    shipment: new Types.ObjectId(shipmentId)
                }
            );

            await ShipmentProduct.insertMany(data);

            logger.info(`Products added to the shipment`);

            return {
                success: true,
                message: "Prodcuts added to the shipment successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to add products. Please try again.",
                `Failed to add products for ${body.shipmentId}`
            );
        }
    }

    static updateShipmentDetails = async (
        body: {
            companyId: string,
            shipmentId: string
            warehouseId: string,
            destinationWarehouseId: string,
            schedule: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType,
                    destinationWarehouseId: IdType,
                    schedule: z.date().optional(),
                }),
                body
            );

            const {
                companyId,
                destinationWarehouseId,
                shipmentId
            } = body;

            const destinationExist = Warehouse.exists({
                _id: new Types.ObjectId(destinationWarehouseId),
                company: new Types.ObjectId(companyId)
            });

            if (!destinationExist) {
                throw new AppError("Invalid destination warehouse", 401);
            }

            await Shipment.findByIdAndUpdate(
                shipmentId,
                {
                    warehouse: new Types.ObjectId(body.warehouseId),
                    destinationWarehouse: new Types.ObjectId(destinationWarehouseId),
                    schedule: body.schedule
                }
            );

            logger.info(`Shipment details updated`);

            return {
                success: true,
                message: "Shipment details updated successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to update shipment details. Please try again.",
                `Failed to update shipment details for ${body.shipmentId}`
            );
        }
    }

    static updateShipmentStatus = async (
        body: {
            companyId: string,
            shipmentId: string,
            status: string
        }
    ) => {
        try {
            validate(
                z.object({
                    shipmentId: IdType,
                    companyId: IdType,
                    status: this.shipmentShape.status,
                }),
                body
            );

            const { shipmentId, status } = body;

            const shipment = await Shipment.findOne(
                {
                    _id: new Types.ObjectId(shipmentId),
                    company: new Types.ObjectId(body.companyId)
                }
            );

            if (!shipment) {
                throw new AppError("Shipment doesn't exist", 401);
            }

            await Shipment.findByIdAndUpdate(
                shipmentId,
                {
                    status
                }
            );

            if (body.status === "completed") {
                await Product.updateMany(
                    {
                        shipment: new Types.ObjectId(shipmentId)
                    },
                    {
                        $set: {
                            warehouse: shipment.destinationWarehouse
                        }
                    }
                );
            }

            logger.info(`Shipment status updated`);

            return {
                success: true,
                message: "Shipment status updated successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to update shipment status. Please try again.",
                `Failed to update shipment status for ${body.shipmentId}`
            );
        }
    }

    static getShipments = async (
        body: {
            companyId: string,
            limit: string,
            page: string,
            sort: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    limit: z.string(),
                    page: z.string(),
                    sort: z.string()
                }),
                body
            );

            const { companyId } = body;

            const matchConditions: Record<string, any> = {
                company: new Types.ObjectId(companyId)
            };

            const raw_limit = parseInt(body.limit);
            const limit = !raw_limit || (raw_limit > 100) ? 10 : raw_limit;

            const page = parseInt(body.page);
            const sort = SORTS[body.sort];

            const filters: any[] = [
                {
                    $sort: {
                        createdAt: !sort ? -1 : SORTS[body.sort]
                    }
                },
                {
                    $skip: page && page > 0 ? (page - 1) * limit : 0,
                },
                {
                    $limit: limit
                },
            ];

            const data = await Shipment.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched shipments for Company: ${companyId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get shipments. Please try again.",
                `Failed to get shipments for Company: ${body.companyId}`
            );
        }
    }

    static getById = async (
        body: {
            companyId: string,
            shipmentId: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    shipmentId: IdType,
                }),
                body
            );
            const { shipmentId } = body;

            const shipment = await Shipment.get(
                {
                    _id: new Types.ObjectId(shipmentId),
                    company: new Types.ObjectId(body.companyId)
                },
                []
            );

            const data = shipment[0];

            if (!data) {
                throw new AppError("Shipment not found", 401);
            }

            logger.info(`Fetched shipment details for ${shipmentId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get shipment. Please try again.",
                `Failed to get shipment for ${body.shipmentId}`
            );
        }
    }
}