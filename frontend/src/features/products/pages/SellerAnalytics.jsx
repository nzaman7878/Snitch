import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const orderApi = axios.create({
    baseURL: "/api/orders",
    withCredentials: true,
});

const SellerAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await orderApi.get('/seller/analytics');
            setAnalyticsData(response.data);
        } catch (error) {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">Loading Analytics...</div>;
    }

    if (!analyticsData) return null;

    const { analytics, topProducts, recentSales } = analyticsData;
    
    // Find max revenue for scaling the bar chart
    const maxSale = Math.max(...recentSales.map(day => day.revenue), 1); // fallback to 1 to avoid / 0

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
                <div className="pt-10 pb-12 flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <div>
                        <h1
                            className="text-4xl lg:text-5xl font-light leading-tight"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Performance Insights
                        </h1>
                        <div className="mt-4 w-14 h-px" style={{ backgroundColor: '#C9A96E' }} />
                    </div>
                </div>

                {/* ── Key Metrics ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-[#ffffff] p-8 shadow-[0_20px_40px_rgba(27,28,26,0.03)] flex flex-col justify-center border border-[#e5e1da]/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] mb-4">Total Revenue</span>
                        <div className="text-4xl font-light text-[#1b1c1a] font-serif">
                            INR {analytics.totalRevenue?.toLocaleString()}
                        </div>
                    </div>
                    
                    <div className="bg-[#ffffff] p-8 shadow-[0_20px_40px_rgba(27,28,26,0.03)] flex flex-col justify-center border border-[#e5e1da]/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] mb-4">Total Orders</span>
                        <div className="text-4xl font-light text-[#1b1c1a] font-serif">
                            {analytics.totalOrders}
                        </div>
                    </div>

                    <div className="bg-[#ffffff] p-8 shadow-[0_20px_40px_rgba(27,28,26,0.03)] flex flex-col justify-center border border-[#e5e1da]/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] mb-4">Items Sold</span>
                        <div className="text-4xl font-light text-[#1b1c1a] font-serif">
                            {analytics.totalItemsSold}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* ── Recent Sales Chart (Last 7 Days) ── */}
                    <div className="lg:col-span-2 bg-[#ffffff] p-8 shadow-[0_20px_40px_rgba(27,28,26,0.03)] border border-[#e5e1da]/50">
                        <h3 className="font-serif text-2xl text-[#1b1c1a] mb-12">Revenue (Last 7 Days)</h3>
                        
                        <div className="h-64 flex items-end gap-2 sm:gap-6 justify-between pt-4">
                            {recentSales.map((day, idx) => {
                                const heightPercent = (day.revenue / maxSale) * 100;
                                const dateObj = new Date(day._id);
                                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                                        {/* Tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-xs font-medium text-[#1b1c1a] whitespace-nowrap bg-[#fbf9f6] px-2 py-1 rounded shadow-sm border border-[#e5e1da]">
                                            INR {day.revenue.toLocaleString()}
                                        </div>
                                        
                                        {/* Bar */}
                                        <div 
                                            className="w-full bg-[#1b1c1a] hover:bg-[#C9A96E] transition-all duration-500 rounded-t-sm"
                                            style={{ 
                                                height: `${Math.max(heightPercent, 2)}%`, 
                                                minHeight: '4px' 
                                            }}
                                        />
                                        
                                        {/* Label */}
                                        <div className="mt-4 text-xs text-[#7A6E63] uppercase tracking-wider font-medium">
                                            {dayName}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Top Products ── */}
                    <div className="bg-[#ffffff] p-8 shadow-[0_20px_40px_rgba(27,28,26,0.03)] border border-[#e5e1da]/50 flex flex-col">
                        <h3 className="font-serif text-2xl text-[#1b1c1a] mb-8">Top Performers</h3>
                        
                        {topProducts.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-[#7A6E63] italic">
                                No sales data yet.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-[#f5f3f0] shrink-0 overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-[#B5ADA3]">N/A</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#1b1c1a] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {product.title}
                                            </h4>
                                            <div className="text-xs text-[#7A6E63] mt-1">
                                                {product.totalSold} items sold
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-[#1b1c1a]">
                                            INR {product.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SellerAnalytics;
