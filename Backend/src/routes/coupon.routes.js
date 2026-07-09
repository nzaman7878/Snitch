import express from 'express';
import { createCoupon, getSellerCoupons, toggleCouponStatus, validateCoupon } from "../controllers/coupon.controller.js";
import { authenticateUser, authenticateSeller } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Seller Routes
router.post("/create", authenticateUser, authenticateSeller, createCoupon);
router.get("/seller", authenticateUser, authenticateSeller, getSellerCoupons);
router.put("/:id/toggle", authenticateUser, authenticateSeller, toggleCouponStatus);

// Buyer/Public Routes
router.post("/validate", authenticateUser, validateCoupon);

export default router;
