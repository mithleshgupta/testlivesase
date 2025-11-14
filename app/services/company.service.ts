import z from "zod";
import bcrypt from 'bcrypt';
import { Types } from "mongoose";

import logger from "../utils/logger";
import AppError from "../utils/AppError";
import { IdType } from "../utils/types";
import { SignToken } from '../utils/JWT';
import { validate } from "../utils/validator";

import { CompanyTypeSchema } from '../utils/types/typeObjects';

import { Company } from '../models/company.model';
import { User } from '../models/user.model';

import RoleServices from './role.service';
import UserServices from './user.service';

export default class CompanyServices {
    private static shape = CompanyTypeSchema.shape;

    static register = async (
        body: {
            brand_name: string,
            organization: string,
            gstin: string,
            phone: number,
            email: string,
            address: string,
            password: string,
            confirm_password: string
        }
    ) => {
        try {
            validate(
                z.object({
                    brand_name: this.shape.brand_name,
                    organization: this.shape.organization,
                    gstin: this.shape.gstin,
                    phone: this.shape.phone,
                    email: this.shape.email,
                    address: this.shape.address,
                    password: this.shape.password,
                    confirm_password: this.shape.password
                }),
                body
            );

            if (body.password !== body.confirm_password) {
                throw new AppError("Password doesn't match", 400)
            }

            const existing = await User.findOne({
                $or: [
                    { email: body.email },
                    { phone: body.phone }
                ]
            });


            if (existing) {
                if (!!existing.email) {
                    throw new AppError("Email already exists", 409);
                }
                if (!!existing.phone) {
                    throw new AppError("Phone number already exists", 409);
                }
            }

            const { email, phone, password } = body;

            const company = await Company.create({
                brand_name: body.brand_name,
                organization: body.organization,
                gstin: body.gstin,
                phone: phone,
                email: email,
                address: body.address,
            });

            const companyId = company.id.toString();

            logger.info("Company created");

            let role;

            try {
                role = await RoleServices.create({
                    companyId,
                    name: "admin",
                    paths: ["*"],
                    permissions: ["*"],
                    allowUpdate: false
                });
            } catch (err: any) {
                await company.deleteOne();
                
                throw new Error(err);
            }

            logger.info("Roles created");

            let user;

            try {
                user = await UserServices.createUser({
                    email,
                    phone,
                    password,
                    companyId,
                    branchId: companyId,
                    branchPath: "Company",
                    role: "admin"
                });
            } catch (err: any) {
                await company.deleteOne();
                await role.deleteOne();

                throw new Error(err);
            }

            logger.info(`Admin for ${companyId} company created`);

            logger.info(`Company registered: ${body.email}`);

            const token = SignToken({
                id: user.id.toString()
            });

            return {
                success: true,
                token,
                message: "Company registered successfully"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Company registration failed. Please try again.",
                `Company registration failed for ${body.email}`
            );
        }
    }

    static assignRole = async (
        body: {
            companyId: string,
            userId: string,
            roleName: string,
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    userId: IdType,
                    roleName: z.string()
                }),
                body
            );

            const { companyId, userId, roleName } = body;

            const exist = await RoleServices.exists(companyId, roleName);

            if (!exist) {
                RoleServices.exists(companyId, roleName);
            }

            await User.findOneAndUpdate(
                {
                    _id: new Types.ObjectId(userId),
                    company: new Types.ObjectId(companyId)
                },
                {
                    role: roleName
                }
            );

            logger.info(`Role assigned for user: ${userId}`);

            return {
                success: true,
                message: "New role assigned"
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                401,
                "Role assignment failed.",
                `Role assignment failed for ${body.userId}`
            );
        }
    }

    //     static getChildren = async (
    //         body: {
    //             companyId: string,
    //             type: string,
    //             page: string,
    //             sort: string
    //         }
    //     ) => {
    //         try {
    //             validate(
    //                 z.object({
    //                     companyId: IdType,
    //                     type: z.string()
    //                 }),
    //                 body
    //             );


    //             const matchConditions = { company: new Types.ObjectId(body.companyId) };

    //             const page = parseInt(body.page);
    //             const sort = SORTS[body.sort];

    //             const filters = [
    //                 {
    //                     $sort: {
    //                         createdAt: !sort ? -1 : SORTS[body.sort]
    //                     }
    //                 },
    //                 {
    //                     $limit: !page ? 10 : 10 * page
    //                 }
    //             ];

    //             let data: any[] = [];


    //             switch (body.type) {
    //                 case "warehouses":
    //                     data = await Warehouse.get(matchConditions, filters);
    //                     break;
    //                 case "zones":
    //                     data = await Zone.get(matchConditions, filters);
    //                     break;
    //                 case "users":
    //                     data = await User.get(matchConditions, filters);
    //                     break;
    //                 case "roles":
    //                     data = await Role.get(matchConditions, filters);
    //                     break;
    //                 case "shipments":
    //                     data = [];
    //                     break;
    //                 case "products":
    //                     data = await ProductInfo.get(matchConditions, filters);
    //                     break;
    //                 default:
    //                     throw new AppError("Not found", 404);
    //             }

    //             return {
    //                 success: true,
    //                 message: `${body.type} fetched`,
    //                 data
    //             };

    //         } catch (err) {
    //             throw AppError.wrap(
    //                 err,
    //                 401,
    //                 `Failed to fetch ${body.type}.`,
    //                 `Failed to fetch for ${body.type} for ${body.companyId}`
    //             );
    //         }

    //     }
}