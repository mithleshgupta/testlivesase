import { Router } from 'express';

import { authorizationMiddleware } from '../middlewares';
import IdValidator from '../middlewares/validUser';

import {
    createWarehouse,
    createZone,
    getWarehouse,
    getWarehouseById,
    getZones,
    getZoneById
} from '../controllers/warehouse.controller';

const router = Router();

router.post(
    '/',
    authorizationMiddleware,
    createWarehouse
);

router.get(
    '/',
    authorizationMiddleware,
    getWarehouse
);

router.get(
    '/:warehouseId',
    authorizationMiddleware,
    IdValidator.warehouse,
    getWarehouseById
);

router.get(
    '/:warehouseId/zone',
    authorizationMiddleware,
    IdValidator.warehouse,
    getZones
);

router.get(
    '/:warehouseId/zone/:zoneId',
    authorizationMiddleware,
    IdValidator.warehouse,
    getZoneById
);

router.post(
    '/:warehouseId/zone',
    authorizationMiddleware,
    IdValidator.warehouse,
    createZone
);

export default router;