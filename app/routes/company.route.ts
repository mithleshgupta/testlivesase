import { Router } from 'express';
import {
    register,
} from '../controllers/company.controller';

const router = Router();

router.post(
    '/register',
    register
);

export default router;