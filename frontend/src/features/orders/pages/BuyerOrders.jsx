import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getBuyerOrders } from '../service/order.api';
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

const BuyerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getBuyerOrders();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (payload) => {
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === payload.orderId ? { ...order, status: payload.status } : order
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: tokens.primary }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6 md:px-12 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            <h1 className="text-4xl md:text-5xl mb-12 font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: tokens.onSurface }}>
                Your Orders
            </h1>
            
            {orders.length === 0 ? (
                <div className="py-20 text-center" style={{ backgroundColor: tokens.surfaceLow }}>
                    <p className="text-lg mb-6" style={{ color: tokens.onSurfaceVariant }}>You haven't placed any orders yet.</p>
                    <Link 
                        to="/"
                        className="inline-block py-4 px-8 text-xs uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: tokens.primaryDark }}
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map(order => (
                        <div key={order._id} className="p-6 md:p-8" style={{ border: `1px solid ${tokens.outlineVariant}` }}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6" style={{ borderBottom: `1px solid ${tokens.outlineVariant}` }}>
                                <div>
                                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: tokens.secondary }}>Order ID</p>
                                    <p className="font-semibold" style={{ color: tokens.onSurface }}>#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: tokens.secondary }}>Date Placed</p>
                                    <p style={{ color: tokens.onSurface }}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: tokens.secondary }}>Status</p>
                                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full" 
                                        style={{ 
                                            backgroundColor: order.status === 'Delivered' ? '#e6f4ea' : (order.status === 'Cancelled' ? '#fce8e6' : tokens.surfaceHigh),
                                            color: order.status === 'Delivered' ? '#137333' : (order.status === 'Cancelled' ? '#c5221f' : tokens.onSurface)
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                <div className="md:col-span-8 flex flex-wrap gap-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                                                <img src={item.images?.[0]?.url || "https://placehold.co/400x500/eae8e5/7A6E63?text=Snitch."} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="max-w-[200px]">
                                                <p className="text-sm font-medium line-clamp-2" style={{ color: tokens.onSurface }}>{item.title}</p>
                                                <p className="text-xs uppercase mt-1" style={{ color: tokens.secondary }}>Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="md:col-span-4 flex justify-start md:justify-end">
                                    <Link 
                                        to={`/order/${order._id}`}
                                        className="py-3 px-6 text-xs uppercase tracking-widest transition-colors"
                                        style={{ border: `1px solid ${tokens.outline}`, color: tokens.onSurface }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = tokens.surfaceLow}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuyerOrders;
