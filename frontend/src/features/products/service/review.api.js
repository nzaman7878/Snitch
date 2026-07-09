import axios from "axios";

const reviewApiInstance = axios.create({
    baseURL: "/api/reviews",
    withCredentials: true,
});

export const getProductReviewsApi = async (productId) => {
    try {
        const response = await reviewApiInstance.get(`/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createReviewApi = async (productId, rating, text) => {
    try {
        const response = await reviewApiInstance.post(`/`, { productId, rating, text });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
