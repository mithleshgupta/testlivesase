import { Router } from 'express';
import { authorizationMiddleware } from '../middlewares';

import {
    createVendor,
    getVendorById,
    getVendors,
    updateVendor
} from '../controllers/vendor.controller';

const router = Router();

router.get(
    '/',
    authorizationMiddleware,
    getVendors
);

router.get(
    '/:vendorId',
    authorizationMiddleware,
    getVendorById
);

router.post(
    '/',
    authorizationMiddleware,
    createVendor
);

router.patch(
    '/:vendorId',
    authorizationMiddleware,
    updateVendor
);

export default router;