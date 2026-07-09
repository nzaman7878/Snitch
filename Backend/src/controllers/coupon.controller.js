import couponModel from "../models/coupon.model.js";

export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit } = req.body;
        const sellerId = req.user._id;

        // Ensure coupon code is unique
        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists", success: false });
        }

        const coupon = await couponModel.create({
            code: code.toUpperCase(),
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            expiryDate: new Date(expiryDate),
            usageLimit: usageLimit ? Number(usageLimit) : null,
            seller: sellerId
        });

        return res.status(201).json({
            message: "Coupon created successfully",
            success: true,
            coupon
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const getSellerCoupons = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const coupons = await couponModel.find({ seller: sellerId }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Coupons fetched successfully",
            success: true,
            coupons
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user._id;

        const coupon = await couponModel.findOne({ _id: id, seller: sellerId });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or unauthorized", success: false });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        return res.status(200).json({
            message: "Coupon status updated",
            success: true,
            coupon
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code, orderValue } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Coupon code is required", success: false });
        }

        const coupon = await couponModel.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code", success: false });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: "This coupon is currently inactive", success: false });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: "This coupon has expired", success: false });
        }

        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "This coupon usage limit has been reached", success: false });
        }

        if (orderValue !== undefined && coupon.minOrderValue > 0 && orderValue < coupon.minOrderValue) {
            return res.status(400).json({ 
                message: `Minimum order value for this coupon is INR ${coupon.minOrderValue}`, 
                success: false 
            });
        }

        // Calculate discount amount based on passed order value
        let discountAmount = 0;
        if (orderValue !== undefined) {
            if (coupon.discountType === 'percentage') {
                discountAmount = (orderValue * coupon.discountValue) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else {
                discountAmount = coupon.discountValue;
                // Cannot discount more than the order value itself
                if (discountAmount > orderValue) {
                    discountAmount = orderValue;
                }
            }
        }

        return res.status(200).json({
            message: "Coupon is valid",
            success: true,
            coupon,
            discountAmount
        });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};
