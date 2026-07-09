import express from 'express';
import { authenticateSeller, authenticateUser } from '../middlewares/auth.middleware.js';
import { getSellerOrders, updateOrderStatus, getSellerAnalytics, getBuyerOrders, getBuyerOrderDetails, getOrdersByPaymentId } from '../controllers/order.controller.js';

const router = express.Router();

/**
 * @route GET /api/orders/seller/analytics
 * @description Get seller analytics dashboard data
 * @access Private (Seller only)
 */
router.get("/seller/analytics", authenticateSeller, getSellerAnalytics);

/**
 * @route GET /api/orders/seller
 * @description Get all orders for the authenticated seller
 * @access Private (Seller only)
 */
router.get("/seller", authenticateSeller, getSellerOrders);

/**
 * @route PUT /api/orders/:id/status
 * @description Update order status
 * @access Private (Seller only)
 */
router.put("/:id/status", authenticateSeller, updateOrderStatus);

// Buyer Routes
router.get("/buyer", authenticateUser, getBuyerOrders);
router.get("/buyer/:id", authenticateUser, getBuyerOrderDetails);
router.get("/payment/:paymentId", authenticateUser, getOrdersByPaymentId);

export default router;
