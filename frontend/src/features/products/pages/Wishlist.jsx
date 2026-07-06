import React, { useEffect } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { useNavigate, Link } from 'react-router';
import { useSelector } from 'react-redux';

const Wishlist = () => {
    const { wishlistItems, fetchWishlist, toggleWishlist, isLoading } = useWishlist();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchWishlist();
        }
    }, [user, navigate]);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            <div
                className="min-h-screen selection:bg-[#C9A96E]/30 pb-24"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                    {/* Header */}
                    <div className="pt-20 pb-12 text-center border-b mb-12" style={{ borderColor: '#e4e2df' }}>
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6 block" style={{ color: '#C9A96E' }}>
                            Private Curations
                        </span>
                        <h1
                            className="text-4xl lg:text-6xl font-light mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Your Wishlist
                        </h1>
                        <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                            The pieces you have selected for future acquisition.
                        </p>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="text-center py-20" style={{ color: '#7A6E63' }}>
                            Loading your selections...
                        </div>
                    ) : wishlistItems && wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            {wishlistItems.map(product => {
                                // Gracefully handle cases where the product might just be an ID string before population
                                if (typeof product === 'string') return null;

                                const imageUrl = product.images && product.images.length > 0
                                    ? product.images[0].url
                                    : '/snitch_editorial_warm.png';

                                return (
                                    <div key={product._id} className="group relative flex flex-col">
                                        <div 
                                            className="aspect-[4/5] overflow-hidden mb-6 cursor-pointer" 
                                            style={{ backgroundColor: '#f5f3f0' }}
                                            onClick={() => navigate(`/product/${product._id}`)}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        
                                        {/* Remove Button Overlay */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                            className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full hover:bg-white transition-all shadow-sm z-10"
                                            aria-label="Remove from wishlist"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#C9A96E" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                            </svg>
                                        </button>

                                        <div className="flex flex-col gap-2">
                                            <h3
                                                className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E] cursor-pointer"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                {product.title}
                                            </h3>

                                            <div className="mt-2">
                                                <span
                                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                                    style={{ color: '#1b1c1a' }}
                                                >
                                                    {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                                </span>
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                                                className="mt-4 text-[10px] uppercase tracking-[0.2em] font-medium text-left hover:text-[#C9A96E] transition-colors"
                                                style={{ color: '#7A6E63' }}
                                            >
                                                Remove from Wishlist
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center flex flex-col items-center">
                            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                Your wishlist is empty.
                            </h2>
                            <p className="max-w-md mx-auto text-sm leading-relaxed mb-8" style={{ color: '#7A6E63' }}>
                                Explore our collection to find pieces you'd like to save for later.
                            </p>
                            <Link 
                                to="/" 
                                className="py-4 px-8 text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                                style={{ backgroundColor: '#1b1c1a', color: '#ffffff' }}
                            >
                                Explore Collection
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wishlist;
