import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment"
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product.variants'
            },
            title: String,
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: priceSchema,
                required: true
            },
            images: [ { url: String } ],
            attributes: {
                type: Map,
                of: String
            }
        }
    ],
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
        default: "Pending"
    },
    shippingAddress: {
        type: String
    }
}, { timestamps: true });

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
