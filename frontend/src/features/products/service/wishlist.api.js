import axios from "axios";

const wishlistApiInstance = axios.create({
    baseURL: "/api/wishlist",
    withCredentials: true
});

export const addToWishlistApi = async (productId) => {
    return await wishlistApiInstance.post(`/${productId}`);
};

export const removeFromWishlistApi = async (productId) => {
    return await wishlistApiInstance.delete(`/${productId}`);
};

export const getWishlistApi = async () => {
    return await wishlistApiInstance.get(`/`);
};
