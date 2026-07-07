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

export const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;
        
        // Match only non-cancelled orders for this seller
        const matchStage = {
            $match: {
                seller: sellerId,
                status: { $ne: "Cancelled" }
            }
        };

        const analytics = await orderModel.aggregate([
            matchStage,
            { $unwind: "$items" },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $multiply: ["$items.price.amount", "$items.quantity"] } },
                    totalItemsSold: { $sum: "$items.quantity" },
                    totalOrders: { $addToSet: "$_id" } // count unique orders
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalItemsSold: 1,
                    totalOrders: { $size: "$totalOrders" }
                }
            }
        ]);

        // Get Top Products
        const topProducts = await orderModel.aggregate([
            matchStage,
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    title: { $first: "$items.title" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price.amount", "$items.quantity"] } },
                    image: { $first: { $arrayElemAt: ["$items.images.url", 0] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Recent Sales (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0,0,0,0);

        const recentSales = await orderModel.aggregate([
            {
                $match: {
                    seller: sellerId,
                    status: { $ne: "Cancelled" },
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    revenue: { $sum: { $multiply: ["$items.price.amount", "$items.quantity"] } },
                    itemsSold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing dates with zero
        const filledRecentSales = [];
        for (let i = 0; i <= 6; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const existing = recentSales.find(s => s._id === dateStr);
            if (existing) {
                filledRecentSales.push(existing);
            } else {
                filledRecentSales.push({ _id: dateStr, revenue: 0, itemsSold: 0 });
            }
        }

        return res.status(200).json({
            success: true,
            analytics: analytics.length > 0 ? analytics[0] : { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 },
            topProducts,
            recentSales: filledRecentSales
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};
