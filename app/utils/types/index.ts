import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import z from "zod";

export interface Route {
    (req: Request, res: Response, next: NextFunction): void;
}

export interface Middleware {
    (req: Request, res: Response, next: NextFunction): void;
}

export interface UserDataType {
    userId: string,
    role: string,
    branchId: string,
    branchPath: string,
    companyId: string,
};

export const ObjectId = z.instanceof(
    Types.ObjectId,
    { message: "Invalid id" }
);

const ObjectIdString = z.string()
    .refine(
        (val: string) => Types.ObjectId.isValid(val),
        { message: "Invalid id" }
    );

export const IdType = z.union([ObjectId, ObjectIdString]);

export const FileType = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional(),
    buffer: z.instanceof(Buffer).optional(),
});