import crypto from "crypto";
import { config } from "../config/config.js";
import paymentModel from "../models/payment.model.js";
import cartModel from "../models/cart.model.js";
import { processSuccessfulPayment } from "../services/order.service.js";

export const razorpayWebhookController = async (req, res) => {
    try {
        const webhookSecret = config.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).json({ message: "Missing Razorpay signature" });
        }

        // Verify the signature using the raw body
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.rawBody || JSON.stringify(req.body))
            .digest("hex");

        if (expectedSignature !== signature) {
            console.warn("Invalid webhook signature received");
            return res.status(400).json({ message: "Invalid signature" });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`[Webhook] Received verified event: ${event}`);

        if (event === "payment.captured") {
            const orderId = payload.payment.entity.order_id;
            const paymentId = payload.payment.entity.id;
            
            try {
                const result = await processSuccessfulPayment(orderId, paymentId);
                console.log(`[Webhook] ${result.message} for orderId: ${orderId}`);
                return res.status(200).json({ message: result.message });
            } catch (error) {
                console.error(`[Webhook] Error processing payment.captured for orderId: ${orderId}:`, error);
                // If it's a "Payment not found" we might want to return 404
                if (error.message.includes("Payment not found")) {
                    return res.status(404).json({ message: "Payment not found" });
                }
                return res.status(400).json({ message: error.message || "Failed to process payment webhook" });
            }
        }

        if (event === "payment.failed") {
            const orderId = payload.payment.entity.order_id;
            const payment = await paymentModel.findOne({ "razorpay.orderId": orderId });

            if (!payment) {
                return res.status(404).json({ message: "Payment not found" });
            }

            if (payment.status === "pending") {
                payment.status = "failed";
                await payment.save();
                console.log(`[Webhook] Successfully processed payment.failed for orderId: ${orderId}`);
            }
            return res.status(200).json({ message: "Webhook processed" });
        }

        // Return 200 for unhandled events
        return res.status(200).json({ message: "Event ignored" });

    } catch (error) {
        console.error("[Webhook] Error processing webhook:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
