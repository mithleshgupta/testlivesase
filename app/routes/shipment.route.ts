import { Router } from 'express';

import { authorizationMiddleware, fileHandler } from '../middlewares';
import validUser from '../middlewares/validUser';

import {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipmentDetails,
    updateShipmentStatus,
    addProductstoShipment
} from '../controllers/shipment.controller';

const router = Router();

router.get(
    '/',
    authorizationMiddleware,
    getShipments
);

router.get(
    '/:shipmentId',
    authorizationMiddleware,
    getShipmentById
);

router.post(
    '/',
    authorizationMiddleware,
    validUser.warehouse,
    createShipment
);

router.patch(
    '/',
    authorizationMiddleware,
    validUser.warehouse,
    updateShipmentDetails
);

router.patch(
    '/status',
    authorizationMiddleware,
    updateShipmentStatus
);

router.post(
    '/add/products',
    authorizationMiddleware,
    fileHandler,
    addProductstoShipment
);

export default router;