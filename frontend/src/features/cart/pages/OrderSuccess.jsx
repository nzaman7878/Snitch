import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router'
import { useSelector } from 'react-redux'
import { getOrderDetails, getLatestOrder } from '../service/cart.api'
import { getOrdersByPaymentId } from '../../orders/service/order.api'
import { useSocket } from '../../Shared/hooks/useSocket'

const tokens = {
    surface: '#fbf9f6',
    surfaceLow: '#f5f3f0',
    surfaceLowest: '#ffffff',
    surfaceHigh: '#eae8e5',
    surfaceHighest: '#e4e2df',
    onSurface: '#1b1c1a',
    onSurfaceVariant: '#4d463a',
    secondary: '#7A6E63',
    muted: '#B5ADA3',
    primary: '#C9A96E',
    primaryDark: '#745a27',
    outlineVariant: '#d0c5b5',
    outline: '#7f7668',
}

const OrderSuccess = () => {
    const location = useLocation()
    const { user } = useSelector(state => state.auth)

    const queryParams = new URLSearchParams(location.search)
    const orderIdParam = queryParams.get("order_id")

    const [order, setOrder] = useState(null)
    const [physicalOrders, setPhysicalOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { socket } = useSocket()

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                let fetchedPayment = null;
                if (orderIdParam && orderIdParam !== "SN-00000") {
                    const data = await getOrderDetails(orderIdParam)
                    if (data.success) {
                        fetchedPayment = data.order;
                        setOrder(data.order)
                    }
                } else {
                    const data = await getLatestOrder()
                    if (data.success) {
                        fetchedPayment = data.order;
                        setOrder(data.order)
                    }
                }

                if (fetchedPayment && fetchedPayment._id) {
                    try {
                        const ordersData = await getOrdersByPaymentId(fetchedPayment._id);
                        if (ordersData.success) {
                            setPhysicalOrders(ordersData.orders);
                        }
                    } catch (err) {
                        console.error("Error fetching physical orders:", err);
                    }
                }
            } catch (error) {
                console.error("Error fetching order details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [orderIdParam])

    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (payload) => {
            setPhysicalOrders(prevOrders => 
                prevOrders.map(o => 
                    o._id === payload.orderId ? { ...o, status: payload.status } : o
                )
            );
        };

        socket.on("order_status_updated", handleStatusUpdate);

        return () => {
            socket.off("order_status_updated", handleStatusUpdate);
        };
    }, [socket]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: tokens.surface }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: tokens.primary }}></div>
            </div>
        )
    }

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            <div 
                className="min-h-screen pb-24 selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: tokens.surface, fontFamily: "'Inter', sans-serif" }}
            >
                <main className="pt-12 lg:pt-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        
                        {/* Left Column: Success Message & Summary */}
                        <div className="lg:col-span-7 space-y-12">
                            <section className="space-y-6">
                                <span 
                                    className="uppercase tracking-[0.2em] text-[10px]"
                                    style={{ color: tokens.secondary }}
                                >
                                    TRANSACTION COMPLETE
                                </span>
                                <h1 
                                    className="text-5xl md:text-7xl leading-tight font-light tracking-tight"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: tokens.onSurface }}
                                >
                                    A piece of our <br/>
                                    <i className="italic">Atelier</i> is yours.
                                </h1>
                                <div className="space-y-2 mt-6">
                                    <p 
                                        className="text-sm uppercase tracking-widest"
                                        style={{ color: tokens.outline }}
                                    >
                                        Order Reference
                                    </p>
                                    <p 
                                        className="text-2xl"
                                        style={{ fontFamily: "'Cormorant Garamond', serif", color: tokens.primaryDark }}
                                    >
                                        #{order?.razorpay?.orderId || "SN-00000"}
                                    </p>
                                </div>
                            </section>
                            
                            <section 
                                className="p-8 md:p-12 space-y-8"
                                style={{ backgroundColor: tokens.surfaceLow }}
                            >
                                <h3 
                                    className="text-xl pb-4"
                                    style={{ fontFamily: "'Cormorant Garamond', serif", borderBottom: `1px solid ${tokens.outlineVariant}` }}
                                >
                                    Order Summary
                                </h3>
                                
                                <div className="space-y-6">
                                    {order?.orderItems?.map((item, index) => (
                                        <div key={index} className="flex gap-6 items-center">
                                            <div 
                                                className="w-24 h-32 flex-shrink-0 overflow-hidden"
                                                style={{ backgroundColor: tokens.surfaceHigh }}
                                            >
                                                <img 
                                                    className="w-full h-full object-cover grayscale-[20%]" 
                                                    alt={item.title} 
                                                    src={item.images?.[0]?.url || "https://placehold.co/400x500/eae8e5/7A6E63?text=Snitch."}
                                                />
                                            </div>
                                            <div className="flex-grow space-y-1">
                                                <h4 
                                                    className="text-lg"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                                >
                                                    {item.title}
                                                </h4>
                                                <p 
                                                    className="text-sm uppercase tracking-tighter"
                                                    style={{ color: tokens.outline }}
                                                >
                                                    Qty: {item.quantity}
                                                </p>
                                                <p className="font-semibold mt-2">
                                                    {item.price?.currency === "USD" ? "$" : "₹"}{item.price?.amount?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div 
                                    className="space-y-4 pt-4"
                                    style={{ borderTop: `1px solid ${tokens.outlineVariant}` }}
                                >
                                    <div 
                                        className="flex justify-between text-sm uppercase tracking-widest"
                                        style={{ color: tokens.secondary }}
                                    >
                                        <span>Subtotal</span>
                                        <span>{order?.price?.currency === "USD" ? "$" : "₹"}{order?.price?.amount?.toLocaleString()}</span>
                                    </div>
                                    <div 
                                        className="flex justify-between text-sm uppercase tracking-widest"
                                        style={{ color: tokens.secondary }}
                                    >
                                        <span>Shipping</span>
                                        <span>Complimentary</span>
                                    </div>
                                    <div 
                                        className="flex justify-between text-lg pt-2"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        <span>Total</span>
                                        <span style={{ color: tokens.primaryDark }}>{order?.price?.currency === "USD" ? "$" : "₹"}{order?.price?.amount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Delivery Details & Actions */}
                        <div className="lg:col-span-5 lg:sticky lg:top-40 space-y-12 mt-12 lg:mt-0">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h3 
                                        className="text-xl italic mb-4"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        Fulfillment Status
                                    </h3>
                                    
                                    {physicalOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {physicalOrders.map((physOrder, idx) => {
                                                const isCancelled = physOrder.status === 'Cancelled';
                                                const isDelivered = physOrder.status === 'Delivered';
                                                
                                                return (
                                                    <div key={physOrder._id} className="flex justify-between items-center border-b pb-3" style={{ borderColor: tokens.outlineVariant }}>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-widest" style={{ color: tokens.secondary }}>Order #{physOrder._id.slice(-6).toUpperCase()}</p>
                                                            <p className="text-sm font-medium mt-1" style={{ color: tokens.onSurface }}>{physOrder.items.length} item(s)</p>
                                                        </div>
                                                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm" 
                                                            style={{ 
                                                                backgroundColor: isCancelled ? '#fce8e6' : (isDelivered ? '#e6f4ea' : tokens.surfaceHigh),
                                                                color: isCancelled ? '#c5221f' : (isDelivered ? '#137333' : tokens.onSurface)
                                                            }}
                                                        >
                                                            {physOrder.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p 
                                            className="leading-relaxed font-semibold uppercase tracking-widest text-lg"
                                            style={{ color: tokens.primaryDark }}
                                        >
                                            {order?.status || "Pending"}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <h3 
                                        className="text-xl italic"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        Arrival Estimate
                                    </h3>
                                    {(() => {
                                        const isAllCancelled = physicalOrders.length > 0 && physicalOrders.every(o => o.status === 'Cancelled');
                                        const isAllDelivered = physicalOrders.length > 0 && physicalOrders.every(o => o.status === 'Delivered');

                                        if (isAllCancelled) {
                                            return <p className="leading-relaxed text-red-600">This order has been cancelled.</p>;
                                        }

                                        if (isAllDelivered) {
                                            return <p className="leading-relaxed text-green-700">Your curated selection has been delivered.</p>;
                                        }

                                        const estimate = (physicalOrders.find(o => o.estimatedDeliveryDate)?.estimatedDeliveryDate) || order?.estimatedDeliveryDate;
                                        
                                        let endDate;
                                        if (estimate && estimate.end) {
                                            endDate = new Date(estimate.end);
                                        } else if (order) {
                                            // Fallback dynamically for old orders
                                            endDate = new Date(order.createdAt || Date.now());
                                            endDate.setDate(endDate.getDate() + 15);
                                        }

                                        if (endDate) {
                                            const formattedDate = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                            return (
                                                <p className="leading-relaxed" style={{ color: tokens.onSurfaceVariant }}>
                                                    Your curated selection is being prepared for transit. Expected delivery by <span className="font-semibold" style={{ color: tokens.onSurface }}>{formattedDate}</span>.
                                                </p>
                                            );
                                        }

                                        return <p className="leading-relaxed" style={{ color: tokens.onSurfaceVariant }}>Calculating arrival estimate...</p>;
                                    })()}
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 
                                        className="text-xl italic"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                    >
                                        Shipping Address
                                    </h3>
                                    <p 
                                        className="leading-relaxed uppercase tracking-tighter text-sm"
                                        style={{ color: tokens.onSurfaceVariant }}
                                    >
                                        {user?.fullname || "Valued Customer"}<br/>
                                        {user?.email}<br/>
                                        {user?.address || "Your details will be verified by our concierge."}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-4 pt-8">
                                    {/* Primary CTA */}
                                    <Link 
                                        to="/orders" 
                                        className="py-5 px-8 text-center text-xs uppercase tracking-[0.2em] transition-all duration-300"
                                        style={{
                                            backgroundColor: tokens.primaryDark,
                                            color: '#ffffff',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.opacity = '0.9'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.opacity = '1'
                                        }}
                                    >
                                        View Order Status
                                    </Link>
                                    
                                    {/* Secondary CTA */}
                                    <Link 
                                        to="/" 
                                        className="py-5 px-8 text-center text-xs uppercase tracking-[0.2em] transition-all duration-300"
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: `1px solid ${tokens.outline}`,
                                            color: tokens.onSurface,
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = tokens.surfaceLow
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                        }}
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                            
                            <div 
                                className="pt-12"
                                style={{ borderTop: `1px solid ${tokens.outlineVariant}40` }}
                            >
                                <p 
                                    className="text-[10px] uppercase tracking-widest leading-loose"
                                    style={{ color: tokens.outline }}
                                >
                                    A confirmation email has been dispatched. For bespoke alterations or inquiries, please contact our private concierge.
                                </p>
                            </div>
                        </div>
                        
                    </div>
                </main>
            </div>
        </>
    )
}

export default OrderSuccess