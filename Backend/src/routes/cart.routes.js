import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validateAddToCart, validateIncrementCartItemQuantity } from '../validator/cart.validator.js';
import { addToCart, createOrderController, getCart, incrementCartItemQuantity, decrementCartItemQuantity, removeCartItem, verifyOrderController } from '../controllers/cart.controller.js';


const router = express.Router();


/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add item to cart
 * @access Private
 * @argument productId - ID of the product to add
 * @argument variantId - ID of the variant to add
 * @argument quantity - Quantity of the item to add (optional, default: 1)
 */
router.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCart)



/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
router.get('/', authenticateUser, getCart)


/**
 * @route PATCH /api/cart/quantity/increment/:productId/:variantId
 * @desc Increment item quantity in cart by one
 * @access Private
 * @argument productId - ID of the product to update
 * @argument variantId - ID of the variant to update
 */
router.patch("/quantity/increment/:productId/:variantId", authenticateUser, validateIncrementCartItemQuantity, incrementCartItemQuantity)

/**
 * @route PATCH /api/cart/quantity/decrement/:productId/:variantId
 * @desc Decrement item quantity in cart by one
 * @access Private
 */
router.patch("/quantity/decrement/:productId/:variantId", authenticateUser, decrementCartItemQuantity)

/**
 * @route DELETE /api/cart/remove/:productId/:variantId
 * @desc Remove item entirely from cart
 * @access Private
 */
router.delete("/remove/:productId/:variantId", authenticateUser, removeCartItem)


/**
 * @route POST /api/cart/payment/create/order
 */
router.post("/payment/create/order", authenticateUser, createOrderController)


router.post("/payment/verify/order", authenticateUser, verifyOrderController)

export default router;