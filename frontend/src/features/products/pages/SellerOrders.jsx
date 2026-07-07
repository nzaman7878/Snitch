import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const orderApi = axios.create({
    baseURL: "/api/orders",
    withCredentials: true,
});

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.get('/seller');
            setOrders(response.data.orders);
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderApi.put(`/${orderId}/status`, { status: newStatus });
            toast.success("Order status updated");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">Loading Orders...</div>;
    }

    return (
        <div className="min-h-screen bg-[#fbf9f6] font-sans selection:bg-[#C9A96E]/30 pb-24">
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            
            <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                {/* ── Top Bar ── */}
                <div className="pt-10 pb-0 flex items-center gap-5">
                    <button
                        onClick={() => navigate('/seller/dashboard')}
                        className="text-lg transition-colors duration-200 leading-none"
                        style={{ color: '#B5ADA3' }}
                        aria-label="Go back"
                        onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                        onMouseLeave={e => e.currentTarget.style.color = '#B5ADA3'}
                    >
                        ←
                    </button>
                    <span
                        className="text-xs font-medium tracking-[0.32em] uppercase"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                    >
                        Snitch.
                    </span>
                </div>

                {/* ── Page Header ── */}
                <div className="pt-10 pb-10">
                    <h1
                        className="text-4xl lg:text-5xl font-light leading-tight"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                    >
                        Order Management
                    </h1>
                    <div className="mt-4 w-14 h-px" style={{ backgroundColor: '#C9A96E' }} />
                </div>

                {orders.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4" style={{ color: '#C9A96E' }}>No Orders Yet</span>
                        <p className="max-w-md mx-auto text-lg leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#7A6E63' }}>
                            When customers purchase your pieces, their orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#e5e1da]">
                                    <th className="py-4 px-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">Order ID</th>
                                    <th className="py-4 px-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">Date</th>
                                    <th className="py-4 px-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">Customer</th>
                                    <th className="py-4 px-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">Items</th>
                                    <th className="py-4 px-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">Total</th>
                                    <th className="py-4 px-4 text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => {
                                    const totalAmount = order.items.reduce((sum, item) => sum + (item.price?.amount * item.quantity), 0);
                                    const currency = order.items[0]?.price?.currency || 'INR';

                                    return (
                                        <tr key={order._id} className="border-b border-[#e5e1da] hover:bg-[#ffffff] transition-colors">
                                            <td className="py-5 px-4 text-sm font-mono text-[#7A6E63]">{order._id.substring(order._id.length - 8)}</td>
                                            <td className="py-5 px-4 text-sm text-[#1b1c1a]">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="py-5 px-4">
                                                <div className="text-sm text-[#1b1c1a] font-medium">{order.buyer?.fullname}</div>
                                                <div className="text-xs text-[#7A6E63]">{order.buyer?.email}</div>
                                            </td>
                                            <td className="py-5 px-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm text-[#1b1c1a]">
                                                        {item.quantity}x {item.title}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="py-5 px-4 text-sm font-medium text-[#1b1c1a]">{currency} {totalAmount.toLocaleString()}</td>
                                            <td className="py-5 px-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className="bg-transparent border border-[#d0c5b5] px-3 py-1 text-xs uppercase tracking-wider text-[#1b1c1a] focus:outline-none focus:border-[#C9A96E]"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerOrders;
