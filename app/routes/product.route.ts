import { Router } from 'express';

import {
    authorizationMiddleware,
    fileHandler,
    productFileHandler,
    validateCsvFile
} from '../middlewares';

import validUser from '../middlewares/validUser';

import {
    createProductInfo,
    deleteProductInfo,
    getProductInfo,
    getByEpcNumber,
    addProductsByFile,
    updateProductInfo,
    getEpcs
} from '../controllers/product.contorller';

const router = Router();

router.post(
    '/get',
    authorizationMiddleware,
    getProductInfo
);

router.post(
    '/',
    authorizationMiddleware,
    productFileHandler,
    //validUser.vendor,
    createProductInfo
);

router.patch(
    '/',
    authorizationMiddleware,
    productFileHandler,
    validUser.vendor,
    updateProductInfo
);

router.get(
    '/epc',
    authorizationMiddleware,
    getEpcs
);

router.post(
    '/epc',
    authorizationMiddleware,
    getByEpcNumber
);

router.post(
    '/epc/add',
    authorizationMiddleware,
    fileHandler,
    validateCsvFile,
    validUser.zone,
    addProductsByFile
);

export default router;