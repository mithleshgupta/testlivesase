import z from 'zod';
import bcrypt from 'bcrypt';
import { join } from 'path';
import { Types } from 'mongoose';

import { SignToken } from '../utils/JWT';

import AppError from '../utils/AppError';
import logger from '../utils/logger';

import { UserTypeSchema } from '../utils/types/typeObjects';
import { validate } from '../utils/validator';
import {
    FileType,
    IdType,
    UserDataType
} from '../utils/types';
import { Reader } from '../utils/csv';
import { generatePassword, validBranch } from '../utils/helpers';
import { SORTS, UPLOAD_DIR } from '../utils/constants';

import { User } from '../models/user.model';
import { Warehouse } from '../models/warehouse.model';
import { Company } from '../models/company.model';

import RoleServices from './role.service';


export default class UserServices {
    private static shape = UserTypeSchema.shape;

    static authorization = async (id: string) => {
        try {

            const exist = await User.findById(id);

            if (!exist) {
                throw new AppError("Unauthorized", 401);
            }

            logger.info(`User authorized: ${id}`);

            const data: UserDataType = {
                userId: id,
                role: exist.role,
                branchId: exist.branch.toString(),
                branchPath: exist.branchPath,
                companyId: exist.company.toString(),
            }

            return data;

        } catch (err) {
            throw AppError.wrap(
                err,
                401,
                "Authorization failed.",
                `Authorization failed`
            );
        }
    };

    static getUsers = async (
        body: {
            companyId: string,
            branchId?: string,
            branchPath?: string,
            role?: string,
            limit: string,
            page: string,
            sort: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    branchId: IdType.optional(),
                    branchPath: this.shape.branchPath.optional(),
                    role: this.shape.role.optional(),
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

            if (body.role) {
                matchConditions["role"] = body.role;
            }

            if (body.branchId) {
                matchConditions["branch"] = new Types.ObjectId(body.branchId);
            }

            if (body.branchPath) {
                matchConditions["branchPath"] = body.branchPath;
            }

            const data = await User.get(
                matchConditions,
                filters
            );

            logger.info(`Fetched users for company: ${companyId}`);

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

    static getById = async (
        body: {
            userId: string
        }
    ) => {
        try {
            validate(
                z.object({
                    userId: IdType,
                }),
                body
            );

            const user = await User.get(
                {
                    _id: new Types.ObjectId(body.userId)
                },
                []
            );

            const data = user[0];

            if (!data) {
                throw new AppError("User not found", 401);
            }

            logger.info(`Fetched user of ${body.userId}`);

            return {
                success: true,
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to get profile. Please try again.",
                `Failed to get profile for ${body.userId}`
            );
        }
    }

    static login = async (
        body: {
            email: string,
            password: string
        }
    ) => {
        try {
            validate(
                z.object({
                    email: this.shape.email,
                    password: this.shape.password
                }),
                body
            );

            const { email, password } = body;

            const user = await User.findOne({ email });

            if (!user) throw new AppError("Invalid email or password", 401);

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) throw new AppError("Invalid email or password", 401);

            const token = SignToken({
                id: user.id.toString()
            });

            logger.info(`User logged in: ${email}`);

            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                },
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Login failed. Please try again.",
                `Login failed for ${body.email}`
            );
        }
    };

    static createUser = async (
        body: {
            companyId: string,
            email: string,
            phone: number,
            password: string,
            branchId: string,
            branchPath: string,
            role: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    email: this.shape.email,
                    phone: this.shape.phone,
                    password: this.shape.password,
                    branchId: this.shape.branch,
                    branchPath: this.shape.branchPath,
                    role: this.shape.role
                }),
                body
            );

            const { branchId, companyId, ...main } = body;

            const user = await User.create({
                ...main,
                company: new Types.ObjectId(companyId),
                branch: new Types.ObjectId(branchId),
            });

            logger.info(`User created`);

            return user;
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "User creation failed. Please try again.",
                `User creation failed`
            );
        }
    }

    static updateUser = async (
        body: {
            companyId: string,
            userId: string,
            email?: string,
            phone?: number,
            branchId?: string,
            branchPath?: string,
            role?: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    userId: IdType,
                    email: this.shape.email.optional(),
                    phone: this.shape.phone.optional(),
                    branchId: this.shape.branch.optional(),
                    branchPath: this.shape.branchPath.optional(),
                    role: this.shape.role.optional()
                }),
                body
            );

            const {
                companyId,
                userId,
                branchId,
                branchPath,
                role
            } = body;

            if (branchId && branchPath) {
                const matchConditions: Record<string, any> = {
                    _id: new Types.ObjectId(branchId)
                };

                let exist;

                validBranch({
                    branchPath,
                    warehouseCase: async () => {
                        matchConditions["company"] = new Types.ObjectId(companyId);
                        exist = await Warehouse.exists(matchConditions);
                    },
                    companyCase: async () => {
                        exist = await Company.exists(matchConditions);
                    }
                });

                if (!exist) {
                    throw new AppError(`Invalid ${branchPath}`);
                }
            }

            if (role) {
                const exist = await RoleServices.exists(
                    companyId,
                    role
                );

                if (!exist) {
                    throw new AppError(`Invalid role`);
                }
            }


            await User.findOneAndUpdate(
                {
                    company: new Types.ObjectId(companyId),
                    userId: new Types.ObjectId(userId)
                },
                {
                    $set: {
                        email: body.email,
                        phone: body.phone,
                        branch: new Types.ObjectId(branchId),
                        branchPath: branchPath,
                        role
                    }
                },
                {
                    omitUndefined: true
                }
            );

            logger.info(`User updated ${userId}`);

            return {
                success: true,
                message: "User updated successfully",
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to update user. Please try again.",
                `Failed to update user for ${body.userId}`
            );
        }
    }

    static createUsersByJSON = async (
        body: {
            companyId: string,
            data: {
                email: string,
                phone: number,
                password?: string
            }[]
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    data: z.array(
                        z.object({
                            email: this.shape.email,
                            phone: this.shape.phone,
                            password: this.shape.password.optional(),
                        })
                    )
                }),
                body
            );

            const { data } = body;

            const new_data = data.map(
                item => ({
                    company: new Types.ObjectId(body.companyId),
                    password: item.password || generatePassword(),
                    ...item
                })
            )

            await User.insertMany(new_data);

            logger.info(`Users created`);

            return {
                success: true,
                message: "Users created successfully",
                data: new_data.map(({ company, ...rest }) => rest)
            };
        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to create users. Please try again.",
                `Failed to create users`
            );
        }
    }

    static createUsersByCSV = async (
        body: {
            companyId: string,
            text: string
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
                    text: z.string()
                }),
                body
            );

            const { text } = body;

            const data = await Reader.fromStringtoObject(
                text,
                undefined,
                {
                    company: new Types.ObjectId(body.companyId),
                },
                {
                    function: generatePassword,
                    key: "password"
                }
            );


            await User.insertMany(
                data
            );

            logger.info(`Users created`);

            return {
                success: true,
                message: "Users created successfully",
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to create users. Please try again.",
                `Failed to create users`
            );
        }
    }

    static createUsersByFile = async (
        body: {
            companyId: string,
            file: Express.Multer.File | undefined
        }
    ) => {
        try {
            validate(
                z.object({
                    companyId: IdType,
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
                undefined,
                {
                    company: new Types.ObjectId(body.companyId)
                },
                {
                    function: generatePassword,
                    key: "password"
                }
            );

            await User.insertMany(
                data
            );

            logger.info(`Users created`);

            return {
                success: true,
                message: "Users created successfully",
                data
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Failed to create users. Please try again.",
                `Failed to create users`
            );
        }
    }
}