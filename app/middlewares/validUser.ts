import { Middleware, UserDataType } from "../utils/types";

import { Types } from "mongoose";

import AppError from "../utils/AppError";

import { Vendor } from "../models/vendor.model";
import { Warehouse } from "../models/warehouse.model";
import { Zone } from "../models/zone.model";
import { validBranch } from "../utils/helpers";

export default class validUser {
    static vendor: Middleware = async (req, _, next) => {
        try {
            const { companyId } = req.data;
            const { vendorId } = req.body;

            if (!vendorId) {
                next();
            }

            const exist = await Vendor.exists({
                _id: new Types.ObjectId(vendorId),
                company: new Types.ObjectId(companyId)
            });

            if (!exist) {
                throw new AppError("Invalid vendor", 401);
            }

            next();
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to check vendor",
                `Failed to check vendor`
            );
        }
    }

    static warehouse: Middleware = async (req, _, next) => {
        try {
            const { companyId, branchId, branchPath } = req.data;

            let warehouseId;

            if (!!req.body) {
                warehouseId = req.body.warehouseId;
            }

            if (!!req.params) {
                warehouseId = req.params.warehouseId;
            }

            if (!warehouseId) {
                throw new AppError("Invalid warehouse", 401);
            }

            validBranch({
                branchPath,
                warehouseCase: () => {
                    if (warehouseId !== branchId) {
                        throw new AppError("Invalid warehouse", 401);
                    }
                },
                companyCase: () => { }
            });

            const exist = await Warehouse.exists({
                _id: new Types.ObjectId(warehouseId),
                company: new Types.ObjectId(companyId)
            });

            if (!exist) {
                throw new AppError("Invalid warehouse", 401);
            }

            next();
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to check warehouse",
                `Failed to check warehouse`
            );
        }
    }

    static zone: Middleware = async (req, _, next) => {
        try {
            const {
                companyId,
                branchPath,
                branchId,
                ...rest
            }: UserDataType = req.data;

            const { zoneId: zoneIdBody } = req.body;
            const { zoneId: zoneIdParams } = req.params;

            const zoneId = zoneIdParams || zoneIdBody;

            if (!zoneId) {
                throw new AppError("Invalid zone", 401);
            }

            const matchConditions: Record<string, any> = {
                _id: new Types.ObjectId(zoneId),
                company: new Types.ObjectId(companyId)
            };

            let exist;
            let warehouseId;

            await validBranch({
                branchPath,
                warehouseCase: async () => {
                    matchConditions["warehouse"] = new Types.ObjectId(branchId);
                    exist = await Zone.exists(matchConditions);
                    warehouseId = branchId;
                },
                companyCase: async () => {
                    exist = await Zone.findOne(matchConditions);
                    warehouseId = exist?.warehouse.toString();
                }
            });

            if (!exist) {
                throw new AppError("Invalid zone", 401);
            }

            req.data["warehouseId"] = warehouseId;

            next();
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to check zone",
                `Failed to check zone`
            );
        }
    }
}