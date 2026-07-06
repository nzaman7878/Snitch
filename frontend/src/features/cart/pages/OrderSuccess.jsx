import React from 'react'
import { useLocation } from 'react-router'

const OrderSuccess = () => {
    const location = useLocation()

    const queryParams = new URLSearchParams(location.search)
    const orderId = queryParams.get("order_id")

    return (
        <div>
            <h1>Order Success</h1>
            <p>Order ID: {orderId}</p>
        </div>
    )
}

export default OrderSuccess