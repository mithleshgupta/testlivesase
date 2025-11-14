import z from 'zod';
import { Types } from 'mongoose';

import AppError from '../utils/AppError';
import logger from '../utils/logger';

import { WarehouseTypeSchema } from '../utils/types/typeObjects';

import { validate } from '../utils/validator';
import { IdType } from '../utils/types';

import { Warehouse } from '../models/warehouse.model';
import { Zone } from '../models/zone.model';
import { SORTS } from '../utils/constants';

export default class WarehouseServices {
    private static shape = WarehouseTypeSchema.shape;

    static createWarehouse = async (
        body: {
            companyId: string,
            name: string,
            main_person_name: string,
            email: string,
            phone: number,
            address: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    name: this.shape.name,
                    main_person_name: this.shape.main_person_name,
                    email: this.shape.email,
                    phone: this.shape.phone,
                    address: this.shape.address
                }),
                body
            );

            await Warehouse.create({
                ...body,
                company: new Types.ObjectId(body.companyId)
            });

            logger.info(`Warehouse created for ${body.companyId}`);

            return {
                success: true,
                message: "Warehouse created successfully"
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Warehouse creation failed. Please try again.",
                `Warehouse creation failed for ${body.companyId}`
            );
        }
    }

    static getWarehouse = async (
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

            const data = await Warehouse.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched warehouses for Company: ${companyId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get users. Please try again.",
                `Failed to get users for ${body.companyId}`
            );
        }
    }

    static getWarehouseById = async (
        body: {
            companyId: string,
            warehouseId: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType
                }),
                body
            );

            const { companyId, warehouseId } = body;

            const matchConditions = {
                company: new Types.ObjectId(companyId),
                _id: new Types.ObjectId(warehouseId)
            };

            const data = await Warehouse.get(
                matchConditions,
                []
            );

            logger.info(`Got warehouse details for ${warehouseId}`);

            return {
                success: true,
                message: "Success",
                data
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get warehouse. Please try again.",
                `Failed to get warehouse ${body.warehouseId}`
            );
        }
    }

    static createZone = async (
        body: {
            companyId: string,
            warehouseId: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType
                }),
                body
            );

            const {
                companyId,
                warehouseId,
            } = body;

            const data: Record<string, any> = {
                company: new Types.ObjectId(companyId),
                warehouse: new Types.ObjectId(body.warehouseId)
            };

            await Zone.create(data);

            logger.info(`Zone created for Company: ${companyId}, Warehouse: ${warehouseId}`);

            return {
                success: true,
                message: "Zone created successfully"
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Zone creation failed. Please try again.",
                `Zone creation failed for Company: ${body.companyId}, Warehouse: ${body.warehouseId}`
            );
        }
    };

    static getZones = async (
        body: {
            companyId: string,
            warehouseId: string
            limit: string,
            page: string,
            sort: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType,
                    limit: z.string(),
                    page: z.string(),
                    sort: z.string()
                }),
                body
            );

            const { companyId, warehouseId } = body;

            const matchConditions: Record<string, any> = {
                company: new Types.ObjectId(companyId),
                warehouse: new Types.ObjectId(warehouseId)
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

            const data = await Zone.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched zones for Company: ${companyId}, Warehouse: ${warehouseId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get users. Please try again.",
                `Failed to get users for ${body.companyId}`
            );
        }
    }

    static getZoneById = async (
        body: {
            warehouseId: string,
            zoneId: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    zoneId: IdType
                }),
                body
            );

            const { warehouseId, zoneId } = body;

            const matchConditions = {
                _id: new Types.ObjectId(zoneId),
                warehouse: new Types.ObjectId(warehouseId)
            };

            const zone = await Zone.get(
                matchConditions,
                []
            );

            const data = zone[0];

            if (!data) {
                throw new AppError("Vendor not found", 401);
            }

            logger.info(`Got zone details for ${zoneId}`);

            return {
                success: true,
                message: "Success",
                data
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get zone. Please try again.",
                `Failed to get zone ${body.zoneId}`
            );
        }
    };
}