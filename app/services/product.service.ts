import z from 'zod';
import { Types } from 'mongoose';

import AppError from '../utils/AppError';
import logger from '../utils/logger';

import {
    ProductInfoTypeSchema,
    ProductTypeSchema
} from '../utils/types/typeObjects';

import { validate } from '../utils/validator';
import { FileType, IdType } from '../utils/types';
import { SORTS, UPLOAD_DIR } from '../utils/constants';

import { ProductInfo } from '../models/productInfo.model';
import { Product } from '../models/product.model';
import { Reader } from '../utils/csv';
import { join } from 'path';
import { validBranch } from '../utils/helpers';
import { Zone } from '../models/zone.model';
import { fileUploader } from '../utils/storage';

export default class ProductServices {
    private static productInfoShape = ProductInfoTypeSchema.shape;
    private static productShape = ProductTypeSchema.shape;

    static getProductInfo = async (
        getType: "company" | "warehouse" | "zone",
        body: {
            page: string,
            limit: string,
            sort: string,
            productIds: string[],
            companyId: string,
            warehouseId?: string,
            zoneId?: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    page: z.string(),
                    limit: z.string(),
                    sort: z.string(),
                    productIds: z.array(IdType),
                    companyId: IdType,
                    warehouseId: IdType.optional(),
                    zoneId: IdType.optional(),
                }),
                body
            );

            const matchConditions: Record<string, any> = {};

            if (body.productIds.length) {
                matchConditions["_id"] = { $in: body.productIds };
            }

            matchConditions["company"] = new Types.ObjectId(body.companyId);

            switch (getType) {
                case "company":
                    break;
                case "warehouse":
                    if (body.warehouseId) {
                        throw new AppError("Invalid warehouse", 401);
                    }
                    matchConditions["warehouse"] = new Types.ObjectId(body.warehouseId);
                    break;
                case "zone":
                    if (body.warehouseId) {
                        throw new AppError("Invalid warehouse", 401);
                    } else if (body.zoneId) {
                        throw new AppError("Invalid zone", 401);
                    }
                    matchConditions["warehouse"] = new Types.ObjectId(body.warehouseId);
                    matchConditions["zone"] = new Types.ObjectId(body.zoneId);
                    break;
                default:
                    throw new AppError("Invalid category type", 401);
            }

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

            const data = await ProductInfo.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched ProductInfos for ${body.companyId}`);

            return {
                success: true,
                message: "Success",
                data
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                `Failed to get ${getType} product`,
                `Failed to get ${getType} product for
                ${body.companyId && JSON.stringify({ company: body.companyId })}
                ${body.warehouseId && JSON.stringify({ warehouse: body.warehouseId })}
                ${body.zoneId && JSON.stringify({ zone: body.zoneId })}
                `
            );
        }
    }

    static createProductInfo = async (
        body: {
            companyId: string,
            vendorId: string,
            name: string,
            description: string,
            sku: string,
            barcode: string,
            price: number,
            cost_price: number,
            quantity: number,
            low_quantity_trigger: number,
            tax_percentage: number,
            files?: {
                [fieldname: string]: Express.Multer.File[];
            } | Express.Multer.File[]
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    vendorId: IdType.optional(),
                    name: z.string(),
                    description: z.string(),
                    sku: z.string(),
                    barcode: z.string(),
                    price: z.number(),
                    cost_price: z.number(),
                    quantity: z.number(),
                    low_quantity_trigger: z.number(),
                    tax_percentage: z.number()
                }),
                body
            );

            if (!body.files) {
                throw new AppError("No file uploaded", 401);
            }

            const mediaKeys = await fileUploader("media", body.files);
            
            const barcodeUploadKeys = await fileUploader("barcode_upload", body.files);

            const val: Record<string, any> = {
                name: body.name,
                description: body.description,
                sku: body.sku,
                barcode: body.barcode,
                price: body.price,
                cost_price: body.cost_price,
                quantity: body.quantity,
                low_quantity_trigger: body.low_quantity_trigger,
                tax_percentage: body.tax_percentage,
                company: new Types.ObjectId(body.companyId),
                media: mediaKeys,
                barcode_upload: barcodeUploadKeys[0]
            }

            if (body.vendorId) {
                val["vendor"] = new Types.ObjectId(body.vendorId)
            }

            const data = await ProductInfo.create(val);

            logger.info(`Product created succesfully for ${body.companyId}`);

            return {
                success: true,
                message: "Product created succesfully",
                //data
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to create product",
                `Failed to create product ${body.companyId}`
            );
        }
    }

    static deleteProductInfo = async (
        body: {
            productId: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    id: IdType
                }),
                body
            );

            // await ProductInfo.findByIdAndDelete(body.productId);

            return {
                success: true,
                message: "Product deleted"
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to delete product",
                `Failed to delete product ${body.productId}`
            );
        }
    }

    static updateProductInfo = async (
        body: {
            companyId: string,
            productId: string,
            vendorId?: string,
            name?: string,
            description?: string,
            sku?: string,
            barcode?: string,
            price?: number,
            cost_price?: number,
            quantity?: number,
            low_quantity_trigger?: number,
            tax_percentage?: number,
            files?: {
                [fieldname: string]: Express.Multer.File[];
            } | Express.Multer.File[]
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    productId: IdType,
                    vendorId: IdType.optional(),
                    name: z.string().optional(),
                    description: z.string().optional(),
                    sku: z.string().optional(),
                    barcode: z.string().optional(),
                    price: z.number().optional(),
                    cost_price: z.number().optional(),
                    quantity: z.number().optional(),
                    low_quantity_trigger: z.number().optional(),
                    tax_percentage: z.number().optional()
                }),
                body
            );

            const { companyId, productId, vendorId, ...updateData }: any = body;

            if (vendorId) {
                updateData["vendor"] = new Types.ObjectId(vendorId);
            }

            const data = await Product.findOneAndUpdate(
                {
                    _id: new Types.ObjectId(productId),
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

            logger.info(`Product updated succesfully for ${body.productId}`);

            return {
                success: true,
                message: "Product updated succesfully",
                data
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to update product",
                `Failed to update product ${body.productId}`
            );
        }
    }

    static getEpcs = async (
        body: {
            limit: string,
            page: string,
            sort: string,
            companyId: string,
            branchId: string,
            branchPath: string
        }
    ) => {
        try {
            validate(
                z.object({
                    limit: z.string(),
                    page: z.string(),
                    sort: z.string(),
                    companyId: IdType,
                    branchId: IdType,
                    branchPath: z.string()
                }),
                body
            );

            const matchConditions: Record<string, any> = {
                company: new Types.ObjectId(body.companyId)
            };

            await validBranch({
                branchPath: body.branchPath,
                warehouseCase: () => {
                    matchConditions["warehouse"] = new Types.ObjectId(body.branchId);
                },
                companyCase: () => { }
            });

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

            const data = await Product.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched EPC numbers for Company: ${body.companyId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get EPC number info. Please try again.",
                `Failed to get EPC number info for Company: ${body.companyId}`
            );
        }
    }

    static getByEpcNumber = async (
        body: {
            limit: string,
            page: string,
            sort: string,
            companyId: string,
            epcNumbers: string[],
            branchId: string,
            branchPath: string
        }
    ) => {
        try {
            validate(
                z.object({
                    limit: z.string(),
                    page: z.string(),
                    sort: z.string(),
                    companyId: IdType,
                    epcNumbers: z.array(z.string()),
                    branchId: IdType,
                    branchPath: z.string()
                }),
                body
            );

            const { epcNumbers } = body;

            const matchConditions: Record<string, any> = {
                epcNumber: { $in: epcNumbers },
                company: new Types.ObjectId(body.companyId)
            };

            await validBranch({
                branchPath: body.branchPath,
                warehouseCase: () => {
                    matchConditions["warehouse"] = new Types.ObjectId(body.branchId);
                },
                companyCase: () => { }
            });

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

            const data = await Product.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched EPC numbers for Company: ${body.companyId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get EPC number info. Please try again.",
                `Failed to get EPC number info for Company: ${body.companyId}`
            );
        }
    }

    static addProductsByFile = async (
        body: {
            companyId: string,
            warehouseId: string,
            zoneId: string,
            productInfoId: string,
            file: Express.Multer.File | undefined
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    warehouseId: IdType,
                    productInfoId: IdType,
                    file: FileType.optional()
                }),
                body
            );

            if (!body.file) {
                throw new AppError("No file uploaded", 401);
            }

            const filePath = body.file.path;

            const data = await Reader.fromFiletoObject(
                filePath,
                "epcNumber",
                {
                    company: new Types.ObjectId(body.companyId),
                    warehouse: new Types.ObjectId(body.warehouseId),
                    zone: new Types.ObjectId(body.zoneId),
                    productInfo: new Types.ObjectId(body.productInfoId)
                }
            );

            await Product.insertMany(
                data,
                {
                    ordered: false
                }
            );

            logger.info(`EPCs created`);

            return {
                success: true,
                message: "Products added successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to add products. Please try again.",
                `Failed to add products`
            );
        }
    }
}