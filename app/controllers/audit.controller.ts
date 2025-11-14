import AuditService from '../services/audit.service';
import { Route } from '../utils/types';

export const stageEpcs: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { warehouseId } = req.body;

        const file = req.file;

        const result = await AuditService.stage({
            companyId,
            warehouseId,
            file
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}

export const scanEpcs: Route = async (req, res, next) => {
    try {
        const { companyId } = req.data;

        const { uuid } = req.params;

        const file = req.file;

        const result = await AuditService.scan({
            companyId,
            uuid,
            file
        });

        res.status(201).json(result);

    } catch (err) {
        next(err);
    }
}