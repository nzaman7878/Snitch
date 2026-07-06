import express from 'express';
import { razorpayWebhookController } from '../controllers/webhook.controller.js';

const router = express.Router();

/**
 * @route POST /api/webhooks/razorpay
 * @desc Handle Razorpay webhooks
 * @access Public
 */
router.post("/razorpay", razorpayWebhookController);

export default router;
