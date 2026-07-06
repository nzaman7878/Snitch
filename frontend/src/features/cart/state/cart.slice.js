import { createSlice } from "@reduxjs/toolkit";


const cartSlice = createSlice({
    name: "cart",
    initialState: {
        totalPrice: null,
        currency: null,
        items: [],
    },
    reducers: {
        setCart: (state, action) => {
            state.items = action.payload.items;
            state.totalPrice = action.payload.totalPrice;
            state.currency = action.payload.currency;
        },
        addItem: (state, action) => {
            state.items.push(action.payload)
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload

            state.items = state.items.map(item => {
                if (item.product._id === productId && item.variant === variantId) {
                    const priceToAdd = item.product.variants?.price?.amount || item.product.price?.amount || 0;
                    state.totalPrice += priceToAdd;
                    return { ...item, quantity: item.quantity + 1 }
                } else {
                    return item
                }
            })
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload

            state.items = state.items.map(item => {
                if (item.product._id === productId && item.variant === variantId) {
                    const priceToSubtract = item.product.variants?.price?.amount || item.product.price?.amount || 0;
                    state.totalPrice -= priceToSubtract;
                    return { ...item, quantity: item.quantity - 1 }
                } else {
                    return item
                }
            }).filter(item => item.quantity > 0)
        },
        removeCartItemState: (state, action) => {
            const { productId, variantId } = action.payload

            state.items = state.items.filter(item => {
                if (item.product._id === productId && item.variant === variantId) {
                    const priceToSubtract = (item.product.variants?.price?.amount || item.product.price?.amount || 0) * item.quantity;
                    state.totalPrice -= priceToSubtract;
                    return false;
                }
                return true;
            })
        }
    }
})

export const { setCart, addItem, incrementCartItem, decrementCartItem, removeCartItemState } = cartSlice.actions
export default cartSlice.reducer