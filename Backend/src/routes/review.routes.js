import express from 'express';
import { createReview, getProductReviews } from '../controllers/review.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const reviewRouter = express.Router();

reviewRouter.post('/', authenticateUser, createReview);
reviewRouter.get('/:productId', getProductReviews);

export default reviewRouter;
