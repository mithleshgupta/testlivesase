import z from 'zod';
import { Types } from 'mongoose';

import AppError from '../utils/AppError';
import logger from '../utils/logger';

import { ZoneTypeSchema } from '../utils/types/typeObjects';

import { validate } from '../utils/validator';
import { IdType } from '../utils/types';
import { validBranch } from '../utils/helpers';

import { Zone } from '../models/zone.model';

export default class WarehouseServices {
    private static shape = ZoneTypeSchema.shape;

    static create = async (
        body: {
            companyId: string,
            warehouseId?: string,
            branchId: string
            branchPath: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType,
                    branchId: IdType,
                    branchPath: z.string()
                }),
                body
            );

            const { companyId, warehouseId, branchId } = body;

            await validBranch({
                branchPath: body.branchPath,
                warehouseCase: () => {
                    if (warehouseId !== branchId) {
                        throw new AppError("Invalid warehouse", 401);
                    }
                },
                companyCase: () => { }
            });

            const data: Record<string, any> = {
                company: new Types.ObjectId(companyId),
                warehouse: new Types.ObjectId(body.warehouseId),
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


    static getById = async (
        body: {
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

            const { zoneId } = body;

            const matchConditions = {
                zoneId: new Types.ObjectId(zoneId)
            };

            const data = await Zone.get(
                matchConditions,
                []
            );

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