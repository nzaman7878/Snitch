import React, { useEffect, useState } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useSocket } from '../../Shared/hooks/useSocket';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { handleGetSellerProduct } = useProduct();
    const sellerProducts = useSelector(state => state.product.sellerProducts);
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const [sessionOrders, setSessionOrders] = useState(0);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await handleGetSellerProduct({ page, limit: 8, search });
            if (result) {
                setTotalPages(result.totalPages);
                setTotalItems(result.totalItems);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
            setIsTyping(false);
        }, 500); // debounce search

        return () => clearTimeout(timeoutId);
    }, [page, search]);

    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (data) => {
            setSessionOrders(prev => prev + 1);
            toast.success(
                `New Order Received!\n${data.items ? data.items.join(', ') : ''}`,
                { duration: 5000 }
            );
        };

        socket.on('new_order', handleNewOrder);

        return () => {
            socket.off('new_order', handleNewOrder);
        };
    }, [socket]);

    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">

                    {/* ── Top Bar ── */}
                    <div className="pt-10 pb-0 flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
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
                    <div className="pt-10 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                        <div>
                            <h1
                                className="text-4xl lg:text-5xl font-light leading-tight"
                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                            >
                                Your Vault
                            </h1>
                            {/* Gold rule separator */}
                            <div className="mt-4 w-14 h-px" style={{ backgroundColor: '#C9A96E' }} />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <button 
                                onClick={() => navigate('/seller/analytics')}
                                className="py-4 px-6 text-[11px] uppercase tracking-[0.3em] font-medium border border-[#C9A96E] text-[#C9A96E] bg-transparent text-center flex items-center justify-center gap-2 cursor-pointer hover:bg-[#C9A96E]/10 transition-colors"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                <span>Analytics</span>
                            </button>

                            <button 
                                onClick={() => navigate('/seller/orders')}
                                className="py-4 px-6 text-[11px] uppercase tracking-[0.3em] font-medium border border-[#C9A96E] text-[#C9A96E] bg-transparent text-center flex items-center justify-center gap-2 cursor-pointer hover:bg-[#C9A96E]/10 transition-colors"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                <span>Recent Orders</span>
                                <span className="bg-[#C9A96E] text-[#1b1c1a] px-2 py-0.5 rounded-full font-bold">
                                    {sessionOrders}
                                </span>
                            </button>

                            <button
                                onClick={() => navigate('/seller/create-product')}
                                className="py-4 px-8 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300 w-full md:w-auto text-center shrink-0"
                                style={{
                                    backgroundColor: '#1b1c1a',
                                    color: '#fbf9f6',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#C9A96E';
                                    e.currentTarget.style.color = '#1b1c1a';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#1b1c1a';
                                    e.currentTarget.style.color = '#fbf9f6';
                                }}
                            >
                                New Listing
                            </button>
                        </div>
                    </div>

                    {/* ── Filter / Search Bar ── */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <div className="w-full md:w-1/3 relative">
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                    setIsTyping(true);
                                }}
                                className="w-full bg-transparent border-b border-[#d0c5b5] py-2 pl-8 focus:outline-none focus:border-[#C9A96E] placeholder:text-[#d0c5b5] text-sm font-sans"
                            />
                            <svg className="w-4 h-4 text-[#d0c5b5] absolute left-1 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <div className="text-[#7A6E63] text-xs uppercase tracking-widest">
                            {totalItems} {totalItems === 1 ? 'Item' : 'Items'} Found
                        </div>
                    </div>

                    {/* ── Product Grid ── */}
                    {sellerProducts && sellerProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 pb-24">
                            {sellerProducts.map(product => {
                                const imageUrl = product.images && product.images.length > 0
                                    ? product.images[ 0 ].url
                                    : '/snitch_editorial_warm.png'; // Fallback to our warm editorial

                                return (
                                    <div
                                        onClick={() => { navigate(`/seller/product/${product._id}`) }}
                                        key={product._id} className="group cursor-pointer flex flex-col">
                                        {/* Image Container */}
                                        <div className="aspect-[4/5] overflow-hidden mb-6" style={{ backgroundColor: '#f5f3f0' }}>
                                            <img
                                                src={imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3
                                                    className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                                >
                                                    {product.title}
                                                </h3>
                                            </div>

                                            <p
                                                className="text-[12px] line-clamp-2 leading-relaxed"
                                                style={{ color: '#7A6E63' }}
                                            >
                                                {product.description}
                                            </p>

                                            <div className="mt-2">
                                                <span
                                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                                    style={{ color: '#1b1c1a' }}
                                                >
                                                    {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4" style={{ color: '#C9A96E' }}>{search ? 'No Results' : 'Empty Vault'}</span>
                            <p className="max-w-md mx-auto text-lg leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#7A6E63' }}>
                                {search ? 'We couldn\'t find any listings matching your search.' : 'You haven\'t added any curated pieces to your archive yet. Begin by creating a new listing.'}
                            </p>
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 pb-24 border-t border-[#e5e1da] pt-10">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${page === 1 ? 'text-[#d0c5b5] cursor-not-allowed' : 'text-[#1b1c1a] hover:text-[#C9A96E]'}`}
                            >
                                Previous
                            </button>
                            <span className="text-sm font-serif text-[#7A6E63]">
                                Page {page} of {totalPages}
                            </span>
                            <button 
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${page === totalPages ? 'text-[#d0c5b5] cursor-not-allowed' : 'text-[#1b1c1a] hover:text-[#C9A96E]'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;