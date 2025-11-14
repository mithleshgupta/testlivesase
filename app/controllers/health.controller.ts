import AppError from '../utils/AppError';
import { Route } from '../utils/types';

export const getHealth: Route = async (_, res, next) => {
    try {
        res.status(200).json({
            message: 'OK',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        next(new AppError("Health check failed", 500));
    }
}