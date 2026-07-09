import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getBuyerOrderDetails } from '../service/order.api';
import { useSocket } from '../../Shared/hooks/useSocket';

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
};

const STATUS_STAGES = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered"
];

const BuyerOrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const data = await getBuyerOrderDetails(orderId);
                if (data.success) {
                    setOrder(data.order);
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (payload) => {
            if (payload.orderId === orderId) {
                setOrder(prev => prev ? { ...prev, status: payload.status } : prev);
            }
        };

        socket.on("order_status_updated", handleStatusUpdate);

        return () => {
            socket.off("order_status_updated", handleStatusUpdate);
        };
    }, [socket, orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: tokens.primary }}></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
                <div>
                    <h2 className="text-2xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Not Found</h2>
                    <Link to="/orders" className="text-sm underline" style={{ color: tokens.primaryDark }}>Back to Orders</Link>
                </div>
            </div>
        );
    }

    const currentStageIndex = STATUS_STAGES.indexOf(order.status);
    const isCancelled = order.status === "Cancelled";

    const renderArrivalEstimate = () => {
        if (isCancelled) {
            return <p className="leading-relaxed text-red-600">This order has been cancelled.</p>;
        }

        if (order.status === 'Delivered') {
            return <p className="leading-relaxed text-green-700">Your curated selection has been delivered.</p>;
        }

        if (order.estimatedDeliveryDate && order.estimatedDeliveryDate.start && order.estimatedDeliveryDate.end) {
            const startDate = new Date(order.estimatedDeliveryDate.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            const endDate = new Date(order.estimatedDeliveryDate.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            return (
                <p className="leading-relaxed" style={{ color: tokens.onSurfaceVariant }}>
                    Expect arrival between <span className="font-semibold" style={{ color: tokens.onSurface }}>{startDate} — {endDate}</span>.
                </p>
            );
        }

        return <p className="leading-relaxed" style={{ color: tokens.onSurfaceVariant }}>Arrival estimate pending...</p>;
    };

    return (
        <div className="min-h-screen py-12 px-6 md:px-12 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Link to="/orders" className="inline-block text-xs uppercase tracking-widest mb-8 hover:underline" style={{ color: tokens.secondary }}>
                &larr; Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b pb-6" style={{ borderColor: tokens.outlineVariant }}>
                <div>
                    <h1 className="text-3xl md:text-5xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: tokens.onSurface }}>
                        Order #{order._id.slice(-8).toUpperCase()}
                    </h1>
                    <p className="text-sm uppercase tracking-widest" style={{ color: tokens.secondary }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <span className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm" 
                        style={{ 
                            backgroundColor: isCancelled ? '#fce8e6' : (order.status === 'Delivered' ? '#e6f4ea' : tokens.surfaceHigh),
                            color: isCancelled ? '#c5221f' : (order.status === 'Delivered' ? '#137333' : tokens.onSurface)
                        }}
                    >
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Timeline */}
                <div className="lg:col-span-4 lg:pr-8 lg:border-r" style={{ borderColor: tokens.outlineVariant }}>
                    <h3 className="text-xl mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Status</h3>
                    
                    {isCancelled ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
                            <p className="text-red-800 font-semibold mb-1">Order Cancelled</p>
                            <p className="text-sm text-red-600">This order has been cancelled and will not be fulfilled.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-[2px]" style={{ backgroundColor: tokens.surfaceHigh }}></div>
                            
                            <div className="space-y-8">
                                {STATUS_STAGES.map((stage, index) => {
                                    const isCompleted = index <= currentStageIndex;
                                    const isCurrent = index === currentStageIndex;
                                    
                                    return (
                                        <div key={stage} className="relative flex items-start gap-6">
                                            {/* Dot */}
                                            <div 
                                                className={`w-6 h-6 rounded-full flex-shrink-0 z-10 flex items-center justify-center transition-colors duration-500`}
                                                style={{ 
                                                    backgroundColor: isCompleted ? tokens.primaryDark : tokens.surfaceHighest,
                                                    boxShadow: isCurrent ? `0 0 0 4px ${tokens.surfaceHigh}` : 'none'
                                                }}
                                            >
                                                {isCompleted && (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                )}
                                            </div>
                                            
                                            {/* Text */}
                                            <div className="pt-0.5">
                                                <p className={`font-semibold ${isCompleted ? '' : 'opacity-50'}`} style={{ color: isCurrent ? tokens.onSurface : tokens.onSurfaceVariant }}>
                                                    {stage}
                                                </p>
                                                {isCurrent && (
                                                    <p className="text-xs mt-1" style={{ color: tokens.secondary }}>
                                                        Your order is currently {stage.toLowerCase()}.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Arrival Estimate */}
                    <div className="mt-12 pt-8 border-t" style={{ borderColor: tokens.outlineVariant }}>
                        <h3 className="text-xl italic mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Arrival Estimate
                        </h3>
                        {renderArrivalEstimate()}
                    </div>
                </div>
                {/* Right Column: Order Items & Summary */}
                <div className="lg:col-span-8 space-y-12">
                    <div>
                        <h3 className="text-xl mb-6 pb-2 border-b" style={{ fontFamily: "'Cormorant Garamond', serif", borderColor: tokens.outlineVariant }}>Items Ordered</h3>
                        <div className="space-y-6">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-6 items-center">
                                    <div className="w-24 h-32 flex-shrink-0 bg-gray-100">
                                        <img 
                                            src={item.images?.[0]?.url || "https://placehold.co/400x500/eae8e5/7A6E63?text=Snitch."} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.title}</h4>
                                        <p className="text-sm uppercase tracking-tighter mt-1" style={{ color: tokens.secondary }}>Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{item.price?.currency === "USD" ? "$" : "₹"}{item.price?.amount?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerOrderDetails;
