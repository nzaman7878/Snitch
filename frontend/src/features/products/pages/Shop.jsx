import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useWishlist } from '../hooks/useWishlist';
import { Link, useNavigate, useSearchParams } from 'react-router';

const Shop = () => {
    const products = useSelector(state => state.product.products);
    const totalPages = useSelector(state => state.product.totalPages) || 1;
    const currentPage = useSelector(state => state.product.currentPage) || 1;
    const { handleGetAllProducts } = useProduct();
    const { toggleWishlist, isProductInWishlist } = useWishlist();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || 'newest';

    const [category, setCategory] = useState('');
    const [sort, setSort] = useState(urlSort);
    const [page, setPage] = useState(1);

    // Fetch products when filters or page change
    useEffect(() => {
        handleGetAllProducts({ search: urlSearch, category, sort, page, limit: 8 });
    }, [urlSearch, category, sort, page]);

    // Reset page to 1 if a filter changes (except page itself)
    useEffect(() => {
        setPage(1);
    }, [urlSearch, category, sort]);

    // Update sort if URL changes
    useEffect(() => {
        setSort(urlSort);
    }, [urlSort]);

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                    {/* ── Hero / Header ── */}
                    <div className="pt-20 pb-12 text-center flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                            The Collection
                        </span>
                        <h1
                            className="text-5xl lg:text-7xl font-light leading-tight mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Curated Archive
                        </h1>
                        <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                            Discover our latest curation of premium minimalist pieces, meticulously designed for effortless elegance and enduring quality.
                        </p>
                    </div>

                    {/* ── Filters & Search Bar ── */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-t py-6" style={{ borderColor: '#e4e2df' }}>
                        
                        {/* Category & Sort */}
                        <div className="flex w-full md:w-auto gap-4 items-center md:ml-auto">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-transparent text-[10px] uppercase tracking-[0.2em] font-medium outline-none cursor-pointer"
                                style={{ color: '#7A6E63' }}
                            >
                                <option value="">All Categories</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Footwear">Footwear</option>
                            </select>

                            <span className="text-gray-300">|</span>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-transparent text-[10px] uppercase tracking-[0.2em] font-medium outline-none cursor-pointer"
                                style={{ color: '#7A6E63' }}
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="trending">Trending Now</option>
                                <option value="best_sellers">Best Sellers</option>
                                <option value="most_discounted">Most Discounted</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Product Grid ── */}
                    {products && products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 pb-16">
                                {products.map(product => {
                                    const imageUrl = product.images && product.images.length > 0
                                        ? product.images[ 0 ].url
                                        : '/snitch_editorial_warm.png';

                                    return (
                                        <div key={product._id} className="group cursor-pointer flex flex-col">
                                            <div 
                                                className="aspect-[4/5] overflow-hidden mb-6 relative" 
                                                style={{ backgroundColor: '#f5f3f0' }}
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                {product.discount > 0 && (
                                                    <div className="absolute top-4 left-4 bg-[#1b1c1a] text-white px-3 py-1 font-medium tracking-widest text-[10px] z-10">
                                                        {product.discount}% OFF
                                                    </div>
                                                )}
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                                    className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full hover:bg-white transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100"
                                                    aria-label="Toggle wishlist"
                                                >
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        width="16" height="16" 
                                                        viewBox="0 0 24 24" 
                                                        fill={isProductInWishlist(product._id) ? "#C9A96E" : "none"} 
                                                        stroke={isProductInWishlist(product._id) ? "#C9A96E" : "#1b1c1a"} 
                                                        strokeWidth="1.5" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <h3
                                                    className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                                >
                                                    {product.title}
                                                </h3>

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
                                                        {product.discount > 0 ? (
                                                            <>
                                                                <span className="line-through mr-2 opacity-50">{product.price?.currency} {product.price?.amount?.toLocaleString()}</span>
                                                                <span>{product.price?.currency} {(product.price?.amount - (product.price?.amount * (product.discount / 100)))?.toLocaleString()}</span>
                                                            </>
                                                        ) : (
                                                            <span>{product.price?.currency} {product.price?.amount?.toLocaleString()}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Pagination ── */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-6 pb-24">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={page === 1}
                                        className="text-[10px] uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#C9A96E]"
                                        style={{ color: '#1b1c1a' }}
                                    >
                                        Prev
                                    </button>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#7A6E63' }}>
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={page === totalPages}
                                        className="text-[10px] uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#C9A96E]"
                                        style={{ color: '#1b1c1a' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-24 text-center flex flex-col items-center">
                            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                No pieces available.
                            </h2>
                            <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                We are currently preparing our next collection or no pieces match your filters. Please adjust your search and try again.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <footer className="border-t py-12 text-center" style={{ borderColor: '#e4e2df' }}>
                    <span
                        className="text-[10px] uppercase tracking-[0.35em]"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                    >
                        Snitch. © {new Date().getFullYear()}
                    </span>
                </footer>
            </div>
        </>
    );
};

export default Shop;
