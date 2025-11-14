import z from 'zod';

import { Types } from 'mongoose';

import AppError from '../utils/AppError';
import logger from '../utils/logger';

import { VendorTypeSchema } from '../utils/types/typeObjects';
import { validate } from '../utils/validator';
import { IdType } from '../utils/types';
import { SORTS } from '../utils/constants';

import { Vendor } from '../models/vendor.model';


export default class VendorServices {
    private static shape = VendorTypeSchema.shape;

    static getVendors = async (
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

            const data = await Vendor.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched vendors for Company: ${companyId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get vendors. Please try again.",
                `Failed to get vendors for Company: ${body.companyId}`
            );
        }
    }

    static getById = async (
        body: {
            companyId: string,
            vendorId: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    vendorId: IdType,
                }),
                body
            );
            const { vendorId } = body;

            const vendor = await Vendor.get(
                {
                    _id: new Types.ObjectId(vendorId),
                    company: new Types.ObjectId(body.companyId)
                },
                []
            );

            const data = vendor[0];

            if (!data) {
                throw new AppError("Vendor not found", 401);
            }

            logger.info(`Fetched vendor for ${vendorId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get vendor. Please try again.",
                `Failed to get vendor for ${body.vendorId}`
            );
        }
    }

    static createVendor = async (
        body: {
            companyId: string,
            name: string,
            phone: number,
            email: string,
            address: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    name: this.shape.name,
                    phone: this.shape.phone,
                    email: this.shape.email,
                    address: this.shape.address
                }),
                body
            );

            const { companyId, ...main } = body;

            await Vendor.create({
                ...main,
                company: new Types.ObjectId(companyId),
            });

            logger.info(`Vendor created`);

            return {
                success: true,
                message: "Vendor created successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Vendor creation failed. Please try again.",
                `Vendor creation failed`
            );
        }
    }

    static updateVendor = async (
        body: {
            companyId: string,
            vendorId: string,
            name?: string,
            phone?: number,
            email?: string,
            address?: string
        }
    ) => {
        try {
            validate(
                z.object({
                    company: IdType,
                    name: this.shape.name.optional(),
                    phone: this.shape.phone.optional(),
                    email: this.shape.email.optional(),
                    address: this.shape.address.optional()
                }),
                body
            );

            const { companyId, vendorId, ...updateData } = body;

            await Vendor.findOneAndUpdate(
                {
                    _id: new Types.ObjectId(vendorId),
                    company: new Types.ObjectId(companyId)
                },
                {
                    $set: {
                        ...updateData
                    }
                },
                {
                    omitUndefined: true
                }
            );

            logger.info(`Vendor updated succesfully for ${body.vendorId}`);

            return {
                success: true,
                message: "Vendor updated succesfully"
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to vendor product",
                `Failed to vendor product ${body.vendorId}`
            );
        }
    }
}