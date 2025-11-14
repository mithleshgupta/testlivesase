import AppError from "../utils/AppError";
import { Route } from "../utils/types";

export const notFound: Route = (req, _, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
}