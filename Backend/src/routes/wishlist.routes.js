import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { addToWishlist, removeFromWishlist, getWishlist } from "../controllers/wishlist.controller.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
