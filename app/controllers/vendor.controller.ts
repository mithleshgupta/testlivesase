import { Route } from '../utils/types';
import VendorServices from '../services/vendor.service';

export const getVendors: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { limit, page, sort } = req.query;

        const result = await VendorServices.getVendors({
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

export const getVendorById: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { vendorId } = req.params;

        const result = await VendorServices.getById({
            companyId,
            vendorId
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const createVendor: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const {
            name,
            phone,
            email,
            address
        } = req.body;

        const result = await VendorServices.createVendor({
            companyId,
            name,
            phone,
            email,
            address
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const updateVendor: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { vendorId } = req.params;

        const {
            name,
            phone,
            email,
            address
        } = req.body;

        const result = await VendorServices.updateVendor({
            companyId,
            vendorId,
            name,
            phone,
            email,
            address
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}