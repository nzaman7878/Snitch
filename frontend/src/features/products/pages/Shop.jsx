import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useWishlist } from '../hooks/useWishlist';
import { Link, useNavigate, useSearchParams } from 'react-router';

// Available Filters
const AVAILABLE_COLORS = [
    { name: 'Black', hex: '#1b1c1a' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Green', hex: '#22C55E' }
];

const AVAILABLE_TAGS = ['Summer', 'Essentials', 'Oversized', 'Basics', 'Formal'];

// Dual Range Slider Component
const DualRangeSlider = ({ min, max, onChange }) => {
    const [minValue, setMinValue] = useState(min);
    const [maxValue, setMaxValue] = useState(max);
    
    // Convert to percentage
    const getPercent = (value) => Math.round(((value - 0) / (10000 - 0)) * 100);

    const handleMinChange = (event) => {
        const value = Math.min(Number(event.target.value), maxValue - 100);
        setMinValue(value);
        onChange(value, maxValue);
    };

    const handleMaxChange = (event) => {
        const value = Math.max(Number(event.target.value), minValue + 100);
        setMaxValue(value);
        onChange(minValue, value);
    };

    return (
        <div className="relative w-full pt-4 pb-8">
            <div className="flex justify-between mb-4 text-[10px] font-medium tracking-[0.1em]" style={{ color: '#7A6E63' }}>
                <span>${minValue}</span>
                <span>${maxValue}</span>
            </div>
            
            <div className="slider relative h-1 rounded-md bg-[#e4e2df]">
                <div 
                    className="absolute h-1 bg-[#1b1c1a] rounded-md" 
                    style={{ left: `${getPercent(minValue)}%`, right: `${100 - getPercent(maxValue)}%` }}
                />
            </div>

            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={minValue}
                    onChange={handleMinChange}
                    className="absolute pointer-events-none appearance-none z-20 h-1 w-full opacity-0 cursor-pointer"
                    style={{ top: '-4px' }}
                />
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={maxValue}
                    onChange={handleMaxChange}
                    className="absolute pointer-events-none appearance-none z-20 h-1 w-full opacity-0 cursor-pointer"
                    style={{ top: '-4px' }}
                />
                
                {/* Custom Thumbs */}
                <div 
                    className="absolute h-3 w-3 rounded-full bg-[#1b1c1a] shadow z-30 transform -translate-x-1/2 -translate-y-1"
                    style={{ left: `${getPercent(minValue)}%`, top: '-2px' }}
                />
                <div 
                    className="absolute h-3 w-3 rounded-full bg-[#1b1c1a] shadow z-30 transform -translate-x-1/2 -translate-y-1"
                    style={{ left: `${getPercent(maxValue)}%`, top: '-2px' }}
                />
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                input[type=range]::-webkit-slider-thumb {
                    pointer-events: all;
                    width: 16px;
                    height: 16px;
                    -webkit-appearance: none;
                }
            `}} />
        </div>
    );
};

const Shop = () => {
    const products = useSelector(state => state.product.products);
    const totalPages = useSelector(state => state.product.totalPages) || 1;
    const currentPage = useSelector(state => state.product.currentPage) || 1;
    const { handleGetAllProducts } = useProduct();
    const { toggleWishlist, isProductInWishlist } = useWishlist();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Core parameters from URL
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || 'newest';
    const urlGender = searchParams.get('gender') || '';

    // Advanced Filters State
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState(urlSort);
    const [gender, setGender] = useState(urlGender);
    const [page, setPage] = useState(1);
    
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

    // Debounce for price slider to prevent spamming API
    const debounceTimeout = useRef(null);

    const fetchProducts = () => {
        handleGetAllProducts({ 
            search: urlSearch, 
            category, 
            gender, 
            sort, 
            page, 
            limit: 9, // 3x3 grid fits well
            colors: selectedColors.join(','),
            tags: selectedTags.join(','),
            minPrice: priceRange[0],
            maxPrice: priceRange[1]
        });
    };

    // Fetch products when filters or page change
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        
        debounceTimeout.current = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(debounceTimeout.current);
    }, [urlSearch, category, gender, sort, page, selectedColors, selectedTags, priceRange]);

    // Reset page to 1 if a filter changes (except page itself)
    useEffect(() => {
        setPage(1);
    }, [urlSearch, category, gender, sort, selectedColors, selectedTags, priceRange]);

    useEffect(() => {
        setSort(urlSort);
        setGender(urlGender);
    }, [urlSort, urlGender]);

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
            window.scrollTo(0, 0);
        }
    };

    const toggleColor = (colorName) => {
        setSelectedColors(prev => 
            prev.includes(colorName) 
                ? prev.filter(c => c !== colorName)
                : [...prev, colorName]
        );
    };

    const toggleTag = (tagName) => {
        setSelectedTags(prev => 
            prev.includes(tagName) 
                ? prev.filter(t => t !== tagName)
                : [...prev, tagName]
        );
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
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 xl:px-16 pt-24">
                    {/* ── Hero / Header ── */}
                    <div className="pb-12 text-center flex flex-col items-center border-b border-[#e4e2df] mb-12">
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                            The Collection
                        </span>
                        <h1
                            className="text-4xl lg:text-6xl font-light leading-tight mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            {gender ? `${gender}'s Archive` : "Curated Archive"}
                        </h1>
                        <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                            Discover our latest curation of premium minimalist pieces, meticulously designed for effortless elegance and enduring quality.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 relative pb-24">
                        {/* ── Mobile Sidebar Toggle ── */}
                        <div className="lg:hidden flex justify-between items-center mb-6">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1b1c1a] border border-[#1b1c1a] px-4 py-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <line x1="4" y1="6" x2="20" y2="6"/>
                                    <line x1="4" y1="12" x2="20" y2="12"/>
                                    <line x1="4" y1="18" x2="20" y2="18"/>
                                </svg>
                                Filters
                            </button>
                            <span className="text-xs text-[#7A6E63]">{products?.length || 0} Products</span>
                        </div>

                        {/* ── Left Sidebar (Filters) ── */}
                        <aside className={`lg:w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                            <div className="sticky top-24 pr-4">
                                
                                {/* Gender Filter */}
                                <div className="mb-10">
                                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-[#1b1c1a]">Department</h3>
                                    <div className="flex flex-col gap-3">
                                        {['', 'Men', 'Women', 'Kids'].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`text-left text-[11px] uppercase tracking-[0.15em] transition-colors ${gender === g ? 'text-[#1b1c1a] font-bold' : 'text-[#7A6E63] hover:text-[#1b1c1a]'}`}
                                            >
                                                {g === '' ? 'All Departments' : g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-10">
                                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-[#1b1c1a]">Category</h3>
                                    <div className="flex flex-col gap-3">
                                        {['', 'Clothing', 'Accessories', 'Footwear'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCategory(c)}
                                                className={`text-left text-[11px] uppercase tracking-[0.15em] transition-colors ${category === c ? 'text-[#1b1c1a] font-bold' : 'text-[#7A6E63] hover:text-[#1b1c1a]'}`}
                                            >
                                                {c === '' ? 'All Categories' : c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort Filter */}
                                <div className="mb-10">
                                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-[#1b1c1a]">Sort By</h3>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="w-full bg-transparent border-b border-[#e4e2df] pb-2 text-[11px] uppercase tracking-[0.15em] outline-none cursor-pointer text-[#7A6E63]"
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="trending">Trending Now</option>
                                        <option value="best_sellers">Best Sellers</option>
                                        <option value="most_discounted">Most Discounted</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>

                                {/* Price Filter */}
                                <div className="mb-10">
                                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-[#1b1c1a]">Price Range</h3>
                                    <DualRangeSlider 
                                        min={0} 
                                        max={10000} 
                                        onChange={(min, max) => setPriceRange([min, max])} 
                                    />
                                </div>

                                {/* Colors Filter */}
                                <div className="mb-10">
                                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-[#1b1c1a]">Color</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {AVAILABLE_COLORS.map(color => (
                                            <button
                                                key={color.name}
                                                onClick={() => toggleColor(color.name)}
                                                title={color.name}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColors.includes(color.name) ? 'border-[#1b1c1a] scale-110 shadow-sm' : 'border-transparent shadow-sm hover:scale-110'}`}
                                                style={{ backgroundColor: color.hex, borderColor: selectedColors.includes(color.name) ? '#1b1c1a' : (color.name==='White'? '#e4e2df' : 'transparent') }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Tags/Collections Filter */}
                                <div className="mb-10">
                                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-[#1b1c1a]">Collections</h3>
                                    <div className="flex flex-col gap-3">
                                        {AVAILABLE_TAGS.map(tag => (
                                            <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedTags.includes(tag) ? 'bg-[#1b1c1a] border-[#1b1c1a]' : 'border-[#1b1c1a] group-hover:bg-[#1b1c1a]/10'}`}>
                                                    {selectedTags.includes(tag) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                                <span className="text-[11px] uppercase tracking-[0.1em] text-[#7A6E63]">{tag}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </aside>

                        {/* ── Main Product Grid ── */}
                        <div className="flex-1">
                            <div className="hidden lg:flex justify-between items-center mb-8 border-b border-[#e4e2df] pb-4">
                                <span className="text-xs text-[#7A6E63] uppercase tracking-[0.1em]">
                                    Showing {products?.length || 0} Results {urlSearch && `for "${urlSearch}"`}
                                </span>
                            </div>

                            {products && products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 pb-16">
                                        {products.map(product => {
                                            const imageUrl = product.images && product.images.length > 0
                                                ? product.images[ 0 ].url
                                                : '/snitch_editorial_warm.png';

                                            return (
                                                <div key={product._id} className="group cursor-pointer flex flex-col">
                                                    <div 
                                                        className="aspect-[4/5] overflow-hidden mb-5 relative" 
                                                        style={{ backgroundColor: '#f5f3f0' }}
                                                        onClick={() => navigate(`/product/${product._id}`)}
                                                    >
                                                        {product.discount > 0 && (
                                                            <div className="absolute top-4 left-4 bg-[#1b1c1a] text-white px-2 py-1 font-medium tracking-widest text-[9px] z-10">
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
                                                                width="14" height="14" 
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

                                                    <div className="flex flex-col gap-1.5">
                                                        <h3
                                                            className="text-lg leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                                        >
                                                            {product.title}
                                                        </h3>

                                                        <div className="mt-1">
                                                            <span
                                                                className="text-[11px] uppercase tracking-[0.1em] font-medium"
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
                                        <div className="flex justify-center items-center gap-6 border-t border-[#e4e2df] pt-8">
                                            <button
                                                onClick={handlePreviousPage}
                                                disabled={page === 1}
                                                className="text-[10px] uppercase tracking-[0.2em] font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#C9A96E]"
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
                                                className="text-[10px] uppercase tracking-[0.2em] font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#C9A96E]"
                                                style={{ color: '#1b1c1a' }}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-24 text-center flex flex-col items-center bg-white rounded-md border border-[#e4e2df] p-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e4e2df" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <h2 className="text-2xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                        No pieces found.
                                    </h2>
                                    <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                        We couldn't find any pieces matching your current filters. Try adjusting your price range, clearing selected colors, or selecting a different department.
                                    </p>
                                    <button 
                                        onClick={() => {
                                            setGender(''); setCategory(''); setPriceRange([0, 10000]); setSelectedColors([]); setSelectedTags([]);
                                        }}
                                        className="mt-8 border border-[#1b1c1a] text-[#1b1c1a] px-6 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-[#1b1c1a] hover:text-white transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
