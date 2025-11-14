import ProductServices from '../services/product.service';
import { Route } from '../utils/types';

export const createProductInfo: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const files = req.files;

        const {
            vendorId,
            name,
            description,
            sku,
            barcode,
            price,
            cost_price,
            quantity,
            low_quantity_trigger,
            tax_percentage
        } = req.body;

        const result = await ProductServices.createProductInfo({
            companyId,
            vendorId,
            name,
            description,
            sku,
            barcode,
            price,
            cost_price,
            quantity,
            low_quantity_trigger,
            tax_percentage,
            files
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const getProductInfo: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { type, productIds, warehouse, zone } = req.body;

        const { limit, page, sort } = req.query;

        const result = await ProductServices.getProductInfo(
            type,
            {
                limit: limit?.toString() || "10",
                page: page?.toString() || "1",
                sort: sort?.toString() || "asc",
                productIds,
                companyId,
                warehouseId: warehouse,
                zoneId: zone
            }
        );

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const updateProductInfo: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { productId } = req.params;

        const files = req.files;

        const {
            vendorId,
            name,
            description,
            sku,
            barcode,
            barcode_upload,
            media,
            price,
            cost_price,
            quantity,
            low_quantity_trigger,
            tax_percentage
        } = req.body;

        const result = await ProductServices.updateProductInfo({
            companyId,
            productId,
            vendorId,
            name,
            description,
            sku,
            price,
            cost_price,
            quantity,
            low_quantity_trigger,
            tax_percentage,
            files
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const deleteProductInfo: Route = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const result = await ProductServices.deleteProductInfo({
            productId
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const getByEpcNumber: Route = async (req, res, next) => {
    try {
        const { companyId, branchId, branchPath } = req.data;

        const { epcNumbers } = req.body;

        const { limit, page, sort } = req.query;

        const result = await ProductServices.getByEpcNumber({
            limit: limit?.toString() || "10",
            page: page?.toString() || "1",
            sort: sort?.toString() || "asc",
            companyId,
            epcNumbers,
            branchId,
            branchPath
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const getEpcs: Route = async (req, res, next) => {
    try {
        const { companyId, branchId, branchPath } = req.data;

        const { limit, page, sort } = req.query;

        const result = await ProductServices.getEpcs({
            limit: limit?.toString() || "10",
            page: page?.toString() || "1",
            sort: sort?.toString() || "asc",
            companyId,
            branchId,
            branchPath
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const addProductsByFile: Route = async (req, res, next) => {
    try {
        const { companyId, warehouseId } = req.data;

        const { zoneId, productInfoId } = req.body;

        const file = req.file;

        const result = await ProductServices.addProductsByFile({
            companyId,
            warehouseId,
            zoneId: zoneId?.toString(),
            productInfoId: productInfoId?.toString(),
            file
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const addProducts: Route = async (req, res, next) => {
    try {
        const { companyId, warehouseId } = req.data;

        const { zoneId = "", productInfoId = "" } = req.query;

        const file = req.file;

        const result = await ProductServices.addProductsByFile({
            companyId,
            warehouseId,
            zoneId: zoneId?.toString(),
            productInfoId: productInfoId?.toString(),
            file
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}