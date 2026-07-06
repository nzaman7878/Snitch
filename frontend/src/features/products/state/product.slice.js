import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        totalPages: 1,
        currentPage: 1,
        totalItems: 0
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload.products
            state.totalPages = action.payload.totalPages
            state.currentPage = action.payload.currentPage
            state.totalItems = action.payload.totalItems
        }
    }
})


export const { setSellerProducts, setProducts } = productSlice.actions
export default productSlice.reducer