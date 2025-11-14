import z from "zod";
import { join } from "path";
import { Types } from "mongoose";

import AppError from "../utils/AppError";
import logger from '../utils/logger';

import { Audit } from "../models/audit.model";

import { validate } from "../utils/validator";
import { FileType, IdType } from "../utils/types";
import { Reader } from "../utils/csv";
import { generateUuid } from "../utils/helpers";
import { UPLOAD_DIR } from "../utils/constants";

export default class AuditService {
    static stage = async (
        body: {
            companyId: string,
            warehouseId: string,
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

            const uuid = generateUuid();

            const data = await Reader.fromFiletoObject(
                filePath,
                "epc",
                {
                    uuid,
                    company: new Types.ObjectId(body.companyId),
                    warehouse: new Types.ObjectId(body.warehouseId)
                }
            );
            
            await Audit.insertMany(data);

            logger.info(`EPC document staged: ${uuid}`);

            return {
                success: true,
                message: "File staged for scanning",
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Staging failed.",
                `Staging failed. { Comapny: ${body.companyId}, Warehouse: ${body.warehouseId} }`
            );
        }
    }

    static scan = async (
        body: {
            companyId: string,
            uuid: string,
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

            const epcNumbers = await Reader.fromFiletoList(
                filePath,
                "epc"
            );

            const result = await Audit.scan(
                body.uuid,
                body.companyId,
                epcNumbers
            );

            logger.info(`EPC document scanned ${body.uuid}`);

            return {
                success: true,
                message: "Scanned data",
                result
            };

        } catch (err) {
            throw AppError.wrap(
                err,
                500,
                "Scanning failed.",
                `Scanning failed for ${body.uuid}`
            );
        }
    }
}