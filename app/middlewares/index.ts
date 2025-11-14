import { extname } from 'path';
import { JwtPayload } from "jsonwebtoken";

import { Middleware } from "../utils/types";
import AppError from "../utils/AppError";
import { VerifyToken } from "../utils/JWT";
import { UploadMulter } from "../utils/fileHandler";

import UserServices from "../services/user.service";
import RoleServices from "../services/role.service";

export const authorizationMiddleware: Middleware = async (req, _, next) => {
    try {
        const authHeader = req.headers.authorization?.split(" ");

        if (!authHeader || authHeader[0] !== "Bearer" || !authHeader[1]) {
            throw new AppError("Unauthorized", 401);
        }

        const token = authHeader[1];

        const { id } = VerifyToken(token) as JwtPayload;

        const info = await UserServices.authorization(id);

        await RoleServices.protected(info.companyId, info.role, req.path);

        req.data = info;

        next();
    } catch (err) {
        throw AppError.wrap(
            err,
            500,
            "Unauthorized",
            `Unauthorized`
        );
    }
}

export const validateCsvFile: Middleware = async (req, _, next) => {
    try {
        const file = req.file;

        if (!file) {
            throw new AppError("No file uploaded", 401);
        }
        
        const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
        const ext = extname(file.originalname).toLowerCase();

        if (!allowedMimeTypes.includes(file.mimetype) || ext !== '.csv') {
            throw new AppError("Only CSV file allowed", 401);
        }

        next();
    } catch (err) {
        throw AppError.wrap(
            err,
            500,
            "File upload error",
            `File upload error`
        );
    }
}

export const fileHandler = UploadMulter.single('file');

export const multiFileHander = (
    body: {
        name: string,
        maxCount: number
    }[]
) => UploadMulter.fields(body);

export const csvFileHandler = multiFileHander([
    {
        name: "file",
        maxCount: 1
    }
]);

export const productFileHandler = multiFileHander([
    {
        name: "media",
        maxCount: 10
    },
    {
        name: "barcode_upload",
        maxCount: 1
    }
]);