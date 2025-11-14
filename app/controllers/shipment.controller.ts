import { Route } from "../utils/types";
import ShipmentService from "../services/shipment.service";

export const createShipment: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const {
            warehouseId,
            destinationWarehouseId,
            schedule
        } = req.body;

        const result = await ShipmentService.createShipment({
            companyId,
            warehouseId,
            destinationWarehouseId,
            schedule,
        });

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const getShipments: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { limit, page, sort } = req.query;

        const result = await ShipmentService.getShipments({
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

export const getShipmentById: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;
        const { shipmentId } = req.params;

        const result = await ShipmentService.getById({
            companyId,
            shipmentId
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const updateShipmentStatus: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { shipmentId } = req.params;

        const { status } = req.body;

        const result = await ShipmentService.updateShipmentStatus({
            companyId,
            shipmentId,
            status
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const updateShipmentDetails: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { shipmentId } = req.params;

        const {
            warehouseId,
            destinationWarehouseId,
            schedule
        } = req.body;

        const result = await ShipmentService.updateShipmentDetails({
            companyId,
            shipmentId,
            warehouseId,
            destinationWarehouseId,
            schedule
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}

export const addProductstoShipment: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { shipmentId } = req.params;
        
        const file = req.file;

        const result = await ShipmentService.addProductstoShipment({
            companyId,
            shipmentId,
            file
        });

        return res.status(200).json(result);

    } catch (err) {
        next(err);
    }
}