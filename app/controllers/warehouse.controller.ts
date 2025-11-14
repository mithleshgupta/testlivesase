import { Route } from '../utils/types';
import WarehouseServices from '../services/warehouse.service';

export const createWarehouse: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const {
            name,
            main_person_name,
            email,
            phone,
            address,
        } = req.body;

        const result = await WarehouseServices.createWarehouse({
            companyId,
            name,
            main_person_name,
            email,
            phone,
            address
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

export const getWarehouse: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { limit, page, sort } = req.query;
        
        const result = await WarehouseServices.getWarehouse({
            companyId,
            limit: limit?.toString() || "10",
            page: page?.toString() || "1",
            sort: sort?.toString() || "asc",
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

export const getWarehouseById: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { warehouseId } = req.params;
        
        const result = await WarehouseServices.getWarehouseById({
            companyId,
            warehouseId
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

export const createZone: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { warehouseId } = req.params;

        const result = await WarehouseServices.createZone({
            companyId,
            warehouseId
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}


export const getZones: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        
        const { warehouseId } = req.params;

        const { limit, page, sort } = req.query;

        const result = await WarehouseServices.getZones({
            companyId,
            warehouseId,
            limit: limit?.toString() || "10",
            page: page?.toString() || "1",
            sort: sort?.toString() || "asc",
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

export const getZoneById: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { warehouseId, zoneId } = req.params;

        const result = await WarehouseServices.getZoneById({
            warehouseId,
            zoneId
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}
