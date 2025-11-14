import { Route } from "../utils/types";
import RoleServices from "../services/role.service";

export const createRole: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { name, paths, permissions, allowUpdate } = req.body;

        const result = await RoleServices.createRole({
            companyId,
            name,
            paths,
            permissions,
            allowUpdate
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const getRoles: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { limit, page, sort } = req.query;

        const result = await RoleServices.getRoles({
            companyId,
            limit: limit?.toString() || "10",
            page: page?.toString() || "1",
            sort: sort?.toString() || "asc",
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const getRoleById: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { roleId } = req.params;

        const result = await RoleServices.getById({
            companyId,
            roleId
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const updateRole: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { roleId } = req.params;

        const {
            name,
            paths,
            permissions
        } = req.body;

        const result = await RoleServices.updateRole({
            companyId,
            roleId,
            name,
            paths,
            permissions
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}