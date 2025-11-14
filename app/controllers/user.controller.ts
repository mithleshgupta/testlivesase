import { Route } from '../utils/types';
import UserServices from '../services/user.service';

export const getUsers: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { limit, page, sort } = req.query;
        
        const {
            role,
            branchId,
            branchPath,
        } = req.body;

        const result = await UserServices.getUsers({
            companyId,
            branchId,
            branchPath,
            role,
            limit: limit?.toString() || "10",
            page: page?.toString() || "1",
            sort: sort?.toString() || "asc",
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const getUserById: Route = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const result = await UserServices.getById({
            userId
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const login: Route = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await UserServices.login({
            email,
            password
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const registerUsersByJSON: Route = async (req, res, next) => {
    try {
        const result = await UserServices.createUsersByJSON({
            companyId: req.data.companyId,
            data: req.body
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const registerUsersByCSV: Route = async (req, res, next) => {
    try {
        const text = req.body;

        const result = await UserServices.createUsersByCSV({
            companyId: req.data.companyId,
            text: text
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const registerUsersByFile: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        
        const file = req.file;

        const result = await UserServices.createUsersByFile({
            companyId,
            file
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const updateUserById: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { userId } = req.params;

        const {
            email,
            phone,
            branchId,
            branchPath,
            role
        } = req.body;

        const result = await UserServices.updateUser({
            companyId,
            userId,
            email,
            phone,
            branchId,
            branchPath,
            role
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}