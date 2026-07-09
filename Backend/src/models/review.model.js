import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

// Prevent a user from leaving multiple reviews on the same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const reviewModel = mongoose.model('review', reviewSchema);

export default reviewModel;
