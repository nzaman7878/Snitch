import mongoose from "mongoose";
import paymentModel from "../models/payment.model.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import orderModel from "../models/order.model.js";
import { notifySeller } from "./socket.service.js";

export const processSuccessfulPayment = async (orderId, razorpayPaymentId = null, razorpaySignature = null) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await paymentModel.findOne({
            "razorpay.orderId": orderId,
        }).session(session);

        if (!payment) {
            throw new Error(`Payment not found for orderId: ${orderId}`);
        }

        // Prevent duplicate processing
        if (payment.status === "paid") {
            await session.abortTransaction();
            session.endSession();
            return { message: "Already processed", payment };
        }

        // Decrement stock for each item
        for (const item of payment.orderItems) {
            const result = await productModel.updateOne(
                { 
                    _id: item.productId, 
                    "variants._id": item.variantId,
                    "variants.stock": { $gte: item.quantity } 
                },
                { 
                    $inc: { "variants.$.stock": -item.quantity } 
                },
                { session }
            );

            if (result.modifiedCount === 0) {
                // Throw an error to abort transaction. This prevents overselling.
                const product = await productModel.findOne({ _id: item.productId, "variants._id": item.variantId }).session(session);
                if (!product) {
                    throw new Error(`Product or variant not found for item: ${item.title}`);
                }
                const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                const currentStock = variant ? variant.stock : 0;
                throw new Error(`Insufficient stock for item: ${item.title}. Requested: ${item.quantity}, Available: ${currentStock}`);
            }
        }

        // Update payment status to paid
        payment.status = "paid";
        if (razorpayPaymentId) payment.razorpay.paymentId = razorpayPaymentId;
        if (razorpaySignature) payment.razorpay.signature = razorpaySignature;
        
        await payment.save({ session });

        // Clear user's cart
        await cartModel.findOneAndUpdate(
            { user: payment.user },
            { $set: { items: [] } },
            { session, new: true }
        );

        await session.commitTransaction();
        session.endSession();

        // After successful transaction, notify the sellers
        try {
            // Collect unique sellers for this order
            const sellerNotifications = new Map(); // sellerId -> items
            
            for (const item of payment.orderItems) {
                const product = await productModel.findById(item.productId);
                if (product && product.seller) {
                    const sellerId = product.seller.toString();
                    if (!sellerNotifications.has(sellerId)) {
                        sellerNotifications.set(sellerId, []);
                    }
                    sellerNotifications.get(sellerId).push(item);
                }
            }

            // Create Order records for each seller
            const today = new Date();
            const minEstimate = new Date(today);
            minEstimate.setDate(minEstimate.getDate() + 5);
            const maxEstimate = new Date(today);
            maxEstimate.setDate(maxEstimate.getDate() + 15);

            for (const [sellerId, items] of sellerNotifications.entries()) {
                const newOrder = new orderModel({
                    buyer: payment.user,
                    seller: sellerId,
                    paymentId: payment._id,
                    items: items.map(item => ({
                        product: item.productId,
                        variant: item.variantId,
                        title: item.title,
                        quantity: item.quantity,
                        price: item.price,
                        images: item.images
                    })),
                    status: "Pending", // Assuming shipping address isn't in payment model for now
                    estimatedDeliveryDate: {
                        start: minEstimate,
                        end: maxEstimate
                    }
                });
                await newOrder.save();
            }

            // Emit notifications
            for (const [sellerId, items] of sellerNotifications.entries()) {
                notifySeller(sellerId, {
                    type: "new_order",
                    message: "You have received a new order!",
                    orderId: payment._id,
                    items: items.map(i => i.title)
                });
            }
        } catch (notificationError) {
            console.error("Failed to send seller notifications:", notificationError);
            // Non-blocking error, we don't revert payment for this
        }

        return { message: "Payment processed successfully", payment };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // Re-throw to handle it in the controller
    }
};
