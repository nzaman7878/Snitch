import reviewModel from '../models/review.model.js';
import productModel from '../models/product.model.js';
import orderModel from '../models/order.model.js';
import { clearCache } from '../services/cache.service.js';

export async function createReview(req, res) {
    try {
        const { productId, rating, text } = req.body;
        const userId = req.user._id;

        // Ensure product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Ensure user has purchased the product
        const hasPurchased = await orderModel.findOne({
            buyer: userId,
            'items.product': productId
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: "You can only review products you have purchased", success: false });
        }

        // Check if user already reviewed this product
        const alreadyReviewed = await reviewModel.findOne({
            user: userId,
            product: productId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product", success: false });
        }

        // Create the review
        const review = await reviewModel.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            text
        });

        // Recalculate average rating
        const reviews = await reviewModel.find({ product: productId });
        const numReviews = reviews.length;
        const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        // Update product
        product.numReviews = numReviews;
        product.averageRating = averageRating;
        await product.save();

        // Invalidate cache for the homepage
        clearCache();

        return res.status(201).json({ message: "Review added successfully", success: true, review });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel.find({ product: productId })
            .populate('user', 'fullname')
            .sort({ createdAt: -1 });

        return res.status(200).json({ message: "Reviews fetched successfully", success: true, reviews });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}
