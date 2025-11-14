import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    _: NextFunction
) => {
    const error = err instanceof AppError ?
        err
        :
        AppError.wrap(
            err,
            500,
            "Internal server error",
            "Internal server error"
        );

    logger.error(`${req.method} ${req.originalUrl} - ${error.log}`);

    return res.status(error.statusCode).json({
        success: false,
        message: error.message
    });
};