import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, removeCartItemApi, createCartOrder, verifyCartOrder } from "../service/cart.api"
import { useDispatch } from "react-redux"
import { setCart, incrementCartItem, decrementCartItem, removeCartItemState } from "../state/cart.slice"


export const useCart = () => {

    const dispatch = useDispatch()

    async function handleAddItem({ productId, variantId }) {
        const data = await addItem({ productId, variantId })

        return data
    }

    async function handleGetCart() {
        const data = await getCart()
        console.log(data)
        dispatch(setCart(data.cart))
    }

    async function handleIncrementCartItem({ productId, variantId }) {
        dispatch(incrementCartItem({ productId, variantId }))
        try {
            await incrementCartItemApi({ productId, variantId })
        } catch (error) {
            dispatch(decrementCartItem({ productId, variantId }))
            console.error(error)
        }
    }

    async function handleCreateCartOrder() {
        const data = await createCartOrder()
        return data.order
    }

    async function handleVerifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        const data = await verifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
        return data.success
    }

    async function handleDecrementCartItem({ productId, variantId }) {
        dispatch(decrementCartItem({ productId, variantId }))
        try {
            await decrementCartItemApi({ productId, variantId })
        } catch (error) {
            // Revert on failure
            dispatch(incrementCartItem({ productId, variantId }))
            console.error(error)
        }
    }

    async function handleRemoveCartItem({ productId, variantId }) {
        // We'd ideally need the original item and quantity to revert properly, but for simplicity, we can fetch cart on failure
        dispatch(removeCartItemState({ productId, variantId }))
        try {
            await removeCartItemApi({ productId, variantId })
        } catch (error) {
            console.error(error)
            handleGetCart() // fallback to fetch latest state
        }
    }

    return { 
        handleAddItem, 
        handleGetCart, 
        handleIncrementCartItem, 
        handleDecrementCartItem,
        handleRemoveCartItem,
        handleCreateCartOrder, 
        handleVerifyCartOrder 
    }

}