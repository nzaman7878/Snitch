import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [], // Array of product IDs or populated product objects depending on context
    isLoading: false,
    error: null
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlist: (state, action) => {
            state.items = action.payload;
        },
        addToWishlistState: (state, action) => {
            const product = action.payload;
            const exists = state.items.find(item => (item._id || item) === (product._id || product));
            if (!exists) {
                state.items.push(product);
            }
        },
        removeFromWishlistState: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(item => (item._id || item) !== productId);
        },
        setWishlistLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setWishlistError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { 
    setWishlist, 
    addToWishlistState, 
    removeFromWishlistState, 
    setWishlistLoading, 
    setWishlistError 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
