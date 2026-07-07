import orderModel from "../models/order.model.js";

export const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const orders = await orderModel.find({ seller: sellerId })
            .populate("buyer", "fullname email contact")
            .populate("items.product", "title category images")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const sellerId = req.user._id;

        const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status", success: false });
        }

        const order = await orderModel.findOneAndUpdate(
            { _id: id, seller: sellerId },
            { status },
            { new: true }
        ).populate("buyer", "fullname email contact");

        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized", success: false });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};
