import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useWishlist } from '../hooks/useWishlist';
import { getAllProducts } from '../service/product.api';

const ProductCard = ({ product, toggleWishlist, isProductInWishlist, navigate }) => {
    const imageUrl = product.images && product.images.length > 0
        ? product.images[0].url
        : '/snitch_editorial_warm.png';

    const hasDiscount = product.discount > 0;
    const price = product.price?.amount || 0;
    const currency = product.price?.currency || '$';

    return (
        <div className="flex-none w-[75vw] md:w-[350px] snap-start group cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product._id}`)}>
            <div className="aspect-[3/4] bg-surface-container-low mb-4 overflow-hidden relative" style={{ backgroundColor: '#f5f3f0' }}>
                {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-label-caps text-[10px] z-10" style={{ backgroundColor: '#1b1c1a', color: '#fff' }}>
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
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                </button>
            </div>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E] uppercase tracking-wide text-sm font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#1b1c1a' }}
                >
                    {product.title}
                </h3>
                <p className="text-[12px] uppercase tracking-[0.1em]" style={{ color: '#7A6E63' }}>
                    {hasDiscount ? (
                        <>
                            <span className="line-through mr-2 opacity-50">{currency} {price.toLocaleString()}</span>
                            <span>{currency} {(price - (price * (product.discount / 100))).toLocaleString()}</span>
                        </>
                    ) : (
                        <span>{currency} {price.toLocaleString()}</span>
                    )}
                </p>
            </div>
        </div>
    );
};

const ProductCarousel = ({ title, products, toggleWishlist, isProductInWishlist, navigate, onLinkClick }) => {
    if (!products || products.length === 0) return null;

    return (
        <section className="mb-24">
            <div className="px-8 lg:px-16 xl:px-24 flex justify-between items-end mb-8">
                <h3 className="text-3xl lg:text-4xl tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>{title}</h3>
                <button onClick={onLinkClick} className="text-[10px] uppercase tracking-[0.2em] border-b border-[#1b1c1a] pb-1 font-medium" style={{ color: '#1b1c1a' }}>VIEW ALL</button>
            </div>
            <div className="flex overflow-x-auto gap-8 px-8 lg:px-16 xl:px-24 hide-scrollbar snap-x pb-4">
                {products.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        toggleWishlist={toggleWishlist}
                        isProductInWishlist={isProductInWishlist}
                        navigate={navigate}
                    />
                ))}
            </div>
        </section>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const { toggleWishlist, isProductInWishlist } = useWishlist();

    const [collections, setCollections] = useState({
        newArrivals: [],
        trendingNow: [],
        bestSellers: [],
        mostDiscounted: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            setLoading(true);
            try {
                const [newRes, trendingRes, bestRes, discountRes] = await Promise.all([
                    getAllProducts({ sort: 'newest', limit: 8 }),
                    getAllProducts({ sort: 'trending', limit: 8 }),
                    getAllProducts({ sort: 'best_sellers', limit: 8 }),
                    getAllProducts({ sort: 'most_discounted', limit: 8 })
                ]);

                setCollections({
                    newArrivals: newRes.products || [],
                    trendingNow: trendingRes.products || [],
                    bestSellers: bestRes.products || [],
                    mostDiscounted: discountRes.products || []
                });
            } catch (error) {
                console.error("Failed to fetch curated collections:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    const navigateToShop = (sort) => {
        navigate(`/products?sort=${sort}`);
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30 overflow-x-hidden"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                <main className="pt-20">
                    {/* Hero Section */}
                    <section className="relative w-full h-[70vh] lg:h-[80vh] overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')" }}></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-16 left-8 right-8 lg:left-24 lg:right-24 flex flex-col items-center text-center text-white">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>THE SEASON OF SILHOUETTE</h2>
                            <button onClick={() => navigate('/products')} className="bg-[#1b1c1a] text-white px-10 py-4 text-[12px] uppercase tracking-[0.2em] font-medium transition-all hover:opacity-90">
                                SHOP NOW
                            </button>
                        </div>
                    </section>

                    {/* Collections Grid */}
                    <section className="px-4 lg:px-8 xl:px-16 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                            {/* Men's Collection */}
                            <div 
                                className="relative aspect-square md:aspect-[4/5] bg-[#f5f3f0] cursor-pointer group overflow-hidden"
                                onClick={() => navigate('/shop?gender=Men')}
                            >
                                <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop" alt="Menswear" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20"></div>
                                <div className="absolute bottom-8 left-8">
                                    <h3 className="text-3xl lg:text-4xl text-white mb-2 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Menswear</h3>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white border-b border-white/50 pb-1 font-medium">EXPLORE</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-4 lg:gap-8">
                                {/* Women's Collection */}
                                <div 
                                    className="relative aspect-video md:aspect-auto md:flex-1 bg-[#f5f3f0] cursor-pointer group overflow-hidden"
                                    onClick={() => navigate('/shop?gender=Women')}
                                >
                                    <img src="https://images.unsplash.com/photo-1550614000-4b95d466f20b?q=80&w=2070&auto=format&fit=crop" alt="Womenswear" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20"></div>
                                    <div className="absolute bottom-8 left-8">
                                        <h3 className="text-3xl lg:text-4xl text-white mb-2 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Womenswear</h3>
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white border-b border-white/50 pb-1 font-medium">EXPLORE</span>
                                    </div>
                                </div>

                                {/* Kids & Summer Grid */}
                                <div className="grid grid-cols-2 gap-4 lg:gap-8 md:flex-1">
                                    <div 
                                        className="relative bg-[#f5f3f0] cursor-pointer group overflow-hidden aspect-square md:aspect-auto"
                                        onClick={() => navigate('/shop?gender=Kids')}
                                    >
                                        <img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=2070&auto=format&fit=crop" alt="Kids" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20"></div>
                                        <div className="absolute bottom-6 left-6">
                                            <h3 className="text-2xl text-white mb-2 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Kids</h3>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-white border-b border-white/50 pb-1 font-medium">SHOP</span>
                                        </div>
                                    </div>

                                    <div 
                                        className="relative bg-[#f5f3f0] cursor-pointer group overflow-hidden aspect-square md:aspect-auto"
                                        onClick={() => navigate('/shop?tags=Summer')}
                                    >
                                        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" alt="Summer Edit" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20"></div>
                                        <div className="absolute bottom-6 left-6">
                                            <h3 className="text-2xl text-white mb-2 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Summer Edit</h3>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-white border-b border-white/50 pb-1 font-medium">SHOP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Curated Collections */}
                    <div className="py-24">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#7A6E63' }}>Curating Collection...</span>
                            </div>
                        ) : (
                            <>
                                <ProductCarousel 
                                    title="New Arrivals" 
                                    products={collections.newArrivals} 
                                    toggleWishlist={toggleWishlist} 
                                    isProductInWishlist={isProductInWishlist} 
                                    navigate={navigate} 
                                    onLinkClick={() => navigateToShop('newest')}
                                />
                                
                                <ProductCarousel 
                                    title="Trending Now" 
                                    products={collections.trendingNow} 
                                    toggleWishlist={toggleWishlist} 
                                    isProductInWishlist={isProductInWishlist} 
                                    navigate={navigate} 
                                    onLinkClick={() => navigateToShop('trending')}
                                />

                                {/* Mid-Hero Banner */}
                                <section className="px-8 lg:px-16 xl:px-24 mb-24">
                                    <div className="relative w-full aspect-square md:aspect-[21/9] bg-[#1b1c1a] flex items-center justify-center p-12 overflow-hidden">
                                        <div className="absolute inset-0 opacity-40">
                                            <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1607581177699-27038e9c63a7?q=80&w=2070&auto=format&fit=crop" alt="Texture" />
                                        </div>
                                        <div className="relative z-10 text-center">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-white mb-4">THE ATELIER SERIES</p>
                                            <h2 className="text-4xl md:text-6xl text-white mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Hand-Crafted Minimalism</h2>
                                            <button onClick={() => navigate('/products')} className="border border-white text-white px-8 py-3 text-[12px] uppercase tracking-[0.2em] font-medium hover:bg-white hover:text-[#1b1c1a] transition-colors duration-300">
                                                DISCOVER
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <ProductCarousel 
                                    title="Best Sellers" 
                                    products={collections.bestSellers} 
                                    toggleWishlist={toggleWishlist} 
                                    isProductInWishlist={isProductInWishlist} 
                                    navigate={navigate} 
                                    onLinkClick={() => navigateToShop('best_sellers')}
                                />

                                <ProductCarousel 
                                    title="Most Discounted" 
                                    products={collections.mostDiscounted} 
                                    toggleWishlist={toggleWishlist} 
                                    isProductInWishlist={isProductInWishlist} 
                                    navigate={navigate} 
                                    onLinkClick={() => navigateToShop('most_discounted')}
                                />
                            </>
                        )}
                    </div>
                </main>

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

export default Home;