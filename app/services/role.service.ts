import z from "zod";
import { Types } from "mongoose";

import logger from "../utils/logger";
import AppError from "../utils/AppError";

import { RoleTypeSchema } from "../utils/types/typeObjects";
import { validate } from "../utils/validator";
import { IdType } from "../utils/types";
import { SORTS } from "../utils/constants";

import { Role } from "../models/role.model";


export default class RoleServices {
    private static shape = RoleTypeSchema.shape;

    static protected = async (
        companyId: string,
        role: string,
        path: string
    ) => {
        try {
            const rolePerms = await Role.findOne({
                company: new Types.ObjectId(companyId),
                name: role
            });

            if (!rolePerms) {
                throw new AppError(
                    "Forbidden",
                    403,
                    "Role not found"
                );
            }

            if (rolePerms.paths.includes("*")) {
                return;
            }

            if (!rolePerms.paths.includes(path)) {
                throw new AppError("Forbidden", 403);
            }

            return;

        } catch (err) {
            throw AppError.wrap(
                err,
                401,
                "Authorization failed.",
                `Authorization failed`
            );
        }
    }

    static create = async (
        body: {
            companyId: string,
            name: string,
            paths: string[],
            permissions: string[],
            allowUpdate?: boolean
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    name: this.shape.name,
                    paths: this.shape.paths,
                    allowUpdate: this.shape.allowUpdate
                }),
                body
            );

            const {
                companyId,
                name,
                paths,
                permissions,
                allowUpdate
            } = body;

            const exist = await this.exists(companyId, name);

            if (exist) {
                throw new AppError("Role already exist", 401);
            }

            const role = await Role.create({
                company: new Types.ObjectId(companyId),
                name,
                paths,
                permissions,
                allowUpdate: !!allowUpdate
            });

            logger.info(`Role created for ${companyId}`);

            return role;

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Role creation failed.",
                `Role creation failed`
            );
        }
    }

    static createRole = async (
        body: {
            companyId: string,
            name: string,
            paths: string[],
            permissions: string[],
            allowUpdate?: boolean
        }
    ) => {
        await this.create(body);

        return {
            success: true,
            message: "New role created"
        };
    }

    static exists = async (
        companyId: string,
        name: string
    ) => {
        try {
            const exist = await Role.exists({
                company: new Types.ObjectId(companyId),
                name
            });

            logger.info("Role existence checked");

            return !!exist;

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Role check failed.",
                `Role check failed`
            );
        }
    }

    static getRoles = async (
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

            logger.info(`Fetched roles for Company: ${companyId}`);

            const data = await Role.get(
                matchConditions,
                filters
            );

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get roles. Please try again.",
                `Failed to get roles for Company: ${body.companyId}`
            );
        }
    }

    static getById = async (
        body: {
            companyId: string,
            roleId: string
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
            const { roleId } = body;

            const vendor = await Role.get(
                {
                    _id: new Types.ObjectId(roleId),
                    company: new Types.ObjectId(body.companyId)
                },
                []
            );

            const data = vendor[0];

            if (!data) {
                throw new AppError("Role not found", 401);
            }

            logger.info(`Fetched role for ${roleId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get role. Please try again.",
                `Failed to get role for ${body.roleId}`
            );
        }
    }

    static updateRole = async (
        body: {
            companyId: string,
            roleId: string,
            name?: string,
            paths?: string[],
            permissions?: string[],
        }
    ) => {
        try {
            validate(
                z.object({
                    company: IdType,
                    name: this.shape.name.optional(),
                    paths: this.shape.paths.optional(),
                    permissions: this.shape.permissions.optional()
                }),
                body
            );

            const exist = await Role.findById(body.roleId);

            if (!exist) {
                throw new AppError("Invalid role", 401);
            }

            if (!exist.allowUpdate) {
                throw new AppError("Update not allowed on role", 401);
            }

            const { companyId, roleId, ...updateData } = body;

            const data = await Role.findOneAndUpdate(
                {
                    _id: new Types.ObjectId(roleId),
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

            logger.info(`Role updated succesfully for ${roleId}`);

            return {
                success: true,
                message: "Role updated succesfully",
                data
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to update role",
                `Failed to update role ${body.roleId}`
            );
        }
    }
}