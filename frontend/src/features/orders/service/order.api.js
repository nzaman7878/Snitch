import axios from "axios";

const orderApiInstance = axios.create({
    baseURL: "/api/orders",
    withCredentials: true
});

export const getBuyerOrders = async () => {
    const response = await orderApiInstance.get("/buyer");
    return response.data;
};

export const getBuyerOrderDetails = async (orderId) => {
    const response = await orderApiInstance.get(`/buyer/${orderId}`);
    return response.data;
};

export const getOrdersByPaymentId = async (paymentId) => {
    const response = await orderApiInstance.get(`/payment/${paymentId}`);
    return response.data;
};
