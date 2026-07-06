import { useDispatch, useSelector } from 'react-redux';
import { 
    setWishlist, 
    addToWishlistState, 
    removeFromWishlistState, 
    setWishlistLoading, 
    setWishlistError 
} from '../state/wishlist.slice';
import { getWishlistApi, addToWishlistApi, removeFromWishlistApi } from '../service/wishlist.api';

export const useWishlist = () => {
    const dispatch = useDispatch();
    const wishlistItems = useSelector(state => state.wishlist.items);
    const isLoading = useSelector(state => state.wishlist.isLoading);

    const fetchWishlist = async () => {
        try {
            dispatch(setWishlistLoading(true));
            const response = await getWishlistApi();
            if (response.data.success) {
                dispatch(setWishlist(response.data.wishlist));
            }
        } catch (error) {
            dispatch(setWishlistError(error.message));
        } finally {
            dispatch(setWishlistLoading(false));
        }
    };

    const toggleWishlist = async (product) => {
        const isWishlisted = wishlistItems.some(item => (item._id || item) === product._id);
        
        // Optimistic UI update
        if (isWishlisted) {
            dispatch(removeFromWishlistState(product._id));
            try {
                await removeFromWishlistApi(product._id);
            } catch (error) {
                // Revert on failure
                dispatch(addToWishlistState(product));
            }
        } else {
            dispatch(addToWishlistState(product));
            try {
                await addToWishlistApi(product._id);
            } catch (error) {
                // Revert on failure
                dispatch(removeFromWishlistState(product._id));
            }
        }
    };

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id || item) === productId);
    };

    return {
        wishlistItems,
        isLoading,
        fetchWishlist,
        toggleWishlist,
        isProductInWishlist
    };
};
