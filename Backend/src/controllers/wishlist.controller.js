import userModel from "../models/user.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const user = await userModel.findById(userId);

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ success: true, message: "Added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const user = await userModel.findById(userId);

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({ success: true, message: "Removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        // Populate the wishlist with product details
        const user = await userModel.findById(userId).populate('wishlist');

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
