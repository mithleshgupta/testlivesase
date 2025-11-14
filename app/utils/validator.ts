import { ZodError, ZodType } from 'zod';
import AppError from './AppError';

export const validate = (schema: ZodType, body: any) => {
    try {
        schema.parse(body);
        return;
    } catch (err) {
        if (err instanceof ZodError) {
            return new AppError(err.message, 400);
        }
        return err;
    }
}