import { Router } from 'express';

import healthRoutes from './health.route';
import companyRoutes from './company.route';
import userRoutes from './user.route';
import roleRoutes from './role.route';
import warehouseRoutes from './warehouse.route';
import vendorRoutes from './vendor.route';
import productRoutes from './product.route';

const router = Router();

router.use("/health", healthRoutes);
router.use("/company", companyRoutes);
router.use("/user", userRoutes);
router.use("/role", roleRoutes);
router.use("/warehouse", warehouseRoutes);
router.use("/vendor", vendorRoutes);
router.use("/product", productRoutes);

export default router;