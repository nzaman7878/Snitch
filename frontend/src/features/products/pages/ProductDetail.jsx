import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../../cart/hook/useCart';
import { useWishlist } from '../hooks/useWishlist';
import toast from 'react-hot-toast';
import { getProductReviewsApi, createReviewApi } from '../service/review.api';
import { useSelector } from 'react-redux';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById, handleGetAllProducts } = useProduct();
    const { handleAddItem } = useCart();
    const { toggleWishlist, isProductInWishlist } = useWishlist();
    const user = useSelector((state) => state.auth.user);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Fetch Product Details & Reviews
    const fetchProductDetails = async () => {
        try {
            const data = await handleGetProductById(productId);
            const fetchedProduct = data?.product || data;
            
            if (fetchedProduct?.variants) {
                fetchedProduct.variants = fetchedProduct.variants.map(v => {
                    const attrs = {};
                    if (v.size) attrs['Size'] = v.size;
                    if (v.color) attrs['Color'] = v.color;
                    return { ...v, attributes: attrs };
                });
            }
            
            setProduct(fetchedProduct);
            
            // Fetch related products
            if (fetchedProduct?.category || fetchedProduct?.gender) {
                const related = await handleGetAllProducts({ 
                    category: fetchedProduct.category, 
                    gender: fetchedProduct.gender,
                    limit: 5 
                });
                if (related?.products) {
                    setRelatedProducts(related.products.filter(p => p._id !== productId).slice(0, 4));
                }
            }

            // Fetch reviews
            try {
                const reviewData = await getProductReviewsApi(productId);
                if (reviewData?.success) {
                    setReviews(reviewData.reviews);
                }
            } catch (e) {
                console.error("Failed to fetch reviews", e);
            }

            // Add to recently viewed in localStorage
            if (fetchedProduct) {
                try {
                    const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const filtered = existing.filter(p => p._id !== fetchedProduct._id);
                    filtered.unshift({
                        _id: fetchedProduct._id,
                        title: fetchedProduct.title,
                        price: fetchedProduct.price,
                        images: fetchedProduct.images,
                        discount: fetchedProduct.discount
                    });
                    if (filtered.length > 8) filtered.pop();
                    localStorage.setItem('recentlyViewed', JSON.stringify(filtered));
                } catch (e) {
                    console.error('Failed to update recently viewed:', e);
                }
            }
        } catch (error) {
            console.error("Failed to fetch product details", error);
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    // Initialize attributes when product loads
    useEffect(() => {
        if (product?.variants?.length > 0) {
            const firstInStock = product.variants.find(v => v.stock > 0) || product.variants[0];
            setSelectedAttributes(firstInStock.attributes || {});
        }
        setSelectedImage(0);
    }, [product]);

    const activeVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;
        return product.variants.find(v => {
            if (!v.attributes) return false;
            const vKeys = Object.keys(v.attributes);
            const sKeys = Object.keys(selectedAttributes);
            const isMatch = vKeys.every(k => v.attributes[k] === selectedAttributes[k]);
            return vKeys.length === sKeys.length && isMatch;
        });
    }, [product, selectedAttributes]);

    const availableAttributes = useMemo(() => {
        if (!product?.variants) return {};
        const attrs = {};
        product.variants.forEach(variant => {
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([key, value]) => {
                    if (!attrs[key]) attrs[key] = new Set();
                    attrs[key].add(value);
                });
            }
        });
        Object.keys(attrs).forEach(key => {
            attrs[key] = Array.from(attrs[key]);
        });
        return attrs;
    }, [product]);

    const handleAttributeChange = (attrName, value) => {
        const newAttrs = { ...selectedAttributes, [attrName]: value };
        
        const exactMatch = product.variants.find(v => {
            const vAttrs = v.attributes || {};
            return Object.keys(newAttrs).every(k => newAttrs[k] === vAttrs[k]) &&
                Object.keys(vAttrs).every(k => newAttrs[k] === vAttrs[k]);
        });

        if (exactMatch) {
            setSelectedAttributes(exactMatch.attributes);
        } else {
            const fallbackVariant = product.variants.find(v => v.attributes && v.attributes[attrName] === value);
            if (fallbackVariant) {
                setSelectedAttributes(fallbackVariant.attributes);
            } else {
                setSelectedAttributes(newAttrs);
            }
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to leave a review.");
            return;
        }
        if (!reviewForm.text.trim()) {
            toast.error("Review text is required.");
            return;
        }
        
        setIsSubmittingReview(true);
        try {
            await createReviewApi(productId, reviewForm.rating, reviewForm.text);
            toast.success("Review submitted successfully!");
            setShowReviewForm(false);
            setReviewForm({ rating: 5, text: "" });
            // Re-fetch product and reviews to get the updated average rating
            fetchProductDetails();
        } catch (error) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium font-body text-[#1a1c1a]/60">
                        Retrieving details...
                    </p>
                </div>
            </div>
        );
    }

    const displayImages = (activeVariant?.images && activeVariant.images.length > 0)
        ? activeVariant.images
        : (product.images && product.images.length > 0 ? product.images : [{ url: '/snitch_editorial_warm.png' }]);

    const displayPrice = activeVariant?.price?.amount
        ? activeVariant.price
        : product.price;

    const isInStock = activeVariant ? activeVariant.stock > 0 : false;
    
    return (
        <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-body selection:bg-[#d4af37]/30 pb-24">
            
            {/* Main Product Section */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-10 pt-8 lg:pt-16">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                    
                    {/* LEFT: Image Gallery */}
                    <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
                        {displayImages.length > 1 && (
                            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-20 lg:w-24 flex-shrink-0 md:max-h-[calc(100vh-160px)]">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-16 md:w-full aspect-[4/5] overflow-hidden transition-all duration-300 rounded-sm ${selectedImage === idx ? 'opacity-100 ring-1 ring-[#d4af37] ring-offset-2 ring-offset-[#faf9f6]' : 'opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden group rounded-md bg-[#f4f3f1]">
                            <img
                                src={displayImages[selectedImage]?.url || displayImages[0].url}
                                alt={product.title}
                                className="w-full h-full object-cover transition-opacity duration-500"
                            />
                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === 0 ? displayImages.length - 1 : prev - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/80 backdrop-blur-md rounded-full border border-white/20 text-[#1a1c1a] hover:bg-white"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(prev => prev === displayImages.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/80 backdrop-blur-md rounded-full border border-white/20 text-[#1a1c1a] hover:bg-white"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="w-full lg:w-2/5 lg:sticky lg:top-24 flex flex-col pt-2 lg:pt-8">
                        {/* Title & Price */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-semibold leading-[1.1] mb-4 text-[#1a1c1a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="text-lg md:text-xl font-medium text-[#4d4635]">
                                    {displayPrice?.currency} {displayPrice?.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                {activeVariant && (
                                    <span className={`text-[11px] uppercase tracking-[0.15em] font-bold px-2 py-1 rounded-sm ${isInStock ? 'bg-[#efeeeb] text-[#735c00]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                                        {isInStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                )}
                            </div>
                            {/* Short Rating Display */}
                            {product.numReviews > 0 && (
                                <div className="flex items-center gap-2 mt-4 text-[#d4af37]">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'fill-current' : 'fill-[#e3e2e0]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <span className="text-[12px] text-[#7f7663] font-medium tracking-wide">({product.numReviews} Reviews)</span>
                                </div>
                            )}
                        </div>

                        <div className="h-px w-full mb-8 bg-[#e3e2e0]" />

                        {/* Variants */}
                        {Object.entries(availableAttributes).map(([attrName, values]) => (
                            <div key={attrName} className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#4d4635]">
                                        {attrName}
                                    </h3>
                                    <span className="text-[11px] text-[#7f7663]">{selectedAttributes[attrName]}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {values.map(val => {
                                        const isSelected = selectedAttributes[attrName] === val;
                                        
                                        const hypotheticalAttrs = { ...selectedAttributes, [attrName]: val };
                                        const hypVariant = product.variants?.find(v => 
                                            Object.keys(hypotheticalAttrs).every(k => hypotheticalAttrs[k] === (v.attributes || {})[k])
                                        );
                                        const isHypotheticallyOutOfStock = hypVariant && hypVariant.stock <= 0;

                                        return (
                                            <button
                                                key={val}
                                                onClick={() => handleAttributeChange(attrName, val)}
                                                className={`px-5 py-2.5 text-[13px] font-medium transition-all duration-300 rounded-md border 
                                                    ${isSelected ? 'border-[#1a1c1a] bg-[#1a1c1a] text-[#faf9f6]' : 'border-[#d0c5af] text-[#1a1c1a] hover:border-[#1a1c1a]'}
                                                    ${isHypotheticallyOutOfStock && !isSelected ? 'opacity-40 relative' : ''}
                                                `}
                                            >
                                                {val}
                                                {isHypotheticallyOutOfStock && !isSelected && (
                                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-px bg-[#1a1c1a] rotate-12"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Description */}
                        <div className="mb-10">
                            <h3 className="text-[12px] uppercase tracking-[0.1em] font-semibold mb-3 text-[#4d4635]">
                                The Details
                            </h3>
                            <p className="text-[15px] leading-relaxed text-[#4d4635] whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-auto mb-8">
                            <button
                                disabled={!activeVariant || !isInStock}
                                className={`w-full py-4 text-[13px] uppercase tracking-[0.1em] font-bold transition-all duration-300 rounded-md bg-[#1a1c1a] text-[#faf9f6] 
                                    ${(!activeVariant || !isInStock) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4d4635]'}`}
                                onClick={async () => {
                                    const res = await handleAddItem({
                                        productId: product._id,
                                        variantId: activeVariant?._id
                                    });
                                    if (res) toast.success("Added to Cart");
                                }}
                            >
                                {isInStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>

                            <button
                                disabled={!activeVariant || !isInStock}
                                className={`w-full py-4 text-[13px] uppercase tracking-[0.1em] font-bold transition-all duration-300 rounded-md border border-[#d0c5af] bg-transparent text-[#1a1c1a] 
                                    ${(!activeVariant || !isInStock) ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1a1c1a]'}`}
                                onClick={async () => {
                                    const res = await handleAddItem({
                                        productId: product._id,
                                        variantId: activeVariant?._id
                                    });
                                    if (res) {
                                        toast.success("Added to Cart");
                                        navigate('/cart');
                                    }
                                }}
                            >
                                Buy Now
                            </button>
                            
                            <button
                                className={`w-full flex items-center justify-center gap-2 py-3 mt-2 text-[12px] uppercase tracking-[0.1em] font-semibold transition-all duration-300 rounded-md border border-transparent bg-transparent hover:bg-[#efeeeb]
                                    ${isProductInWishlist(product._id) ? 'text-[#d4af37]' : 'text-[#4d4635]'}`}
                                onClick={async () => {
                                    await toggleWishlist(product);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isProductInWishlist(product._id) ? "#d4af37" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                                {isProductInWishlist(product._id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                            </button>
                        </div>

                        {/* Extra elegant details */}
                        <div className="space-y-4 text-[12px] uppercase tracking-[0.05em] font-medium text-[#7f7663]">
                            <div className="flex justify-between border-b border-[#e3e2e0] pb-3">
                                <span>Shipping</span>
                                <span className="text-[#4d4635]">Complimentary over $500</span>
                            </div>
                            <div className="flex justify-between border-b border-[#e3e2e0] pb-3">
                                <span>Returns</span>
                                <span className="text-[#4d4635]">Within 14 days</span>
                            </div>
                            <div className="flex justify-between border-b border-[#e3e2e0] pb-3">
                                <span>Authenticity</span>
                                <span className="text-[#4d4635]">100% Guaranteed</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-10 mt-24">
                <div className="border-t border-[#d0c5af] pt-16">
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Rating Summary */}
                        <div className="w-full md:w-1/3">
                            <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Client Reviews</h2>
                            
                            {product.numReviews > 0 ? (
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-5xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        {product.averageRating.toFixed(1)}
                                    </span>
                                    <div className="flex flex-col pb-1">
                                        <div className="flex text-[#d4af37] mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'fill-current' : 'fill-[#e3e2e0]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                        <span className="text-[12px] text-[#7f7663]">Based on {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[14px] text-[#4d4635] mb-6">This product does not have any reviews yet.</p>
                            )}
                            
                            {!showReviewForm ? (
                                <button 
                                    onClick={() => {
                                        if(!user) return toast.error("You must be logged in to leave a review.");
                                        setShowReviewForm(true);
                                    }}
                                    className="text-[13px] font-bold border-b border-[#1a1c1a] pb-0.5 hover:text-[#d4af37] hover:border-[#d4af37] transition-colors"
                                >
                                    Write a Review
                                </button>
                            ) : (
                                <form onSubmit={submitReview} className="bg-[#f4f3f1] p-6 rounded-md border border-[#e3e2e0] mt-4">
                                    <h4 className="text-[14px] font-semibold mb-4">Leave Your Review</h4>
                                    
                                    <div className="mb-4">
                                        <label className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#4d4635] block mb-2">Rating</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                    className={`w-8 h-8 flex items-center justify-center transition-colors ${star <= reviewForm.rating ? 'text-[#d4af37]' : 'text-[#d0c5af] hover:text-[#d4af37]/50'}`}
                                                >
                                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#4d4635] block mb-2">Review</label>
                                        <textarea 
                                            value={reviewForm.text}
                                            onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                                            className="w-full h-24 p-3 text-[14px] border border-[#d0c5af] rounded-md focus:outline-none focus:border-[#1a1c1a] bg-white resize-none"
                                            placeholder="What did you think about this product?"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmittingReview}
                                            className="flex-1 py-3 bg-[#1a1c1a] text-white text-[12px] uppercase tracking-[0.1em] font-bold rounded-md hover:bg-[#4d4635] disabled:opacity-50 transition-colors"
                                        >
                                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowReviewForm(false)}
                                            className="py-3 px-6 border border-[#d0c5af] text-[12px] uppercase tracking-[0.1em] font-bold rounded-md hover:border-[#1a1c1a] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="w-full md:w-2/3 flex flex-col gap-6">
                            {reviews.length === 0 ? (
                                <div className="bg-[#f4f3f1] p-12 rounded-lg border border-[#efeeeb] flex flex-col items-center justify-center text-center shadow-sm">
                                    <svg className="w-12 h-12 text-[#d0c5af] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <h3 className="text-[16px] font-semibold text-[#1a1c1a] mb-2">Be the first to review</h3>
                                    <p className="text-[14px] text-[#7f7663]">Share your thoughts with other customers</p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="bg-[#ffffff] p-6 rounded-lg border border-[#efeeeb] shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-semibold text-[15px] mb-1">{review.user?.name || "Verified Customer"}</div>
                                                <div className="flex text-[#d4af37]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'fill-[#e3e2e0]'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[12px] text-[#7f7663]">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-[#4d4635] leading-relaxed whitespace-pre-wrap">
                                            {review.text}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-10 mt-24">
                    <div className="border-t border-[#d0c5af] pt-16">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>You Might Also Like</h2>
                            <Link to="/collections" className="text-[13px] font-bold border-b border-[#1a1c1a] pb-0.5 hover:text-[#d4af37] hover:border-[#d4af37] transition-colors">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map(rel => (
                                <Link key={rel._id} to={`/product/${rel._id}`} className="group block">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#f4f3f1] mb-4">
                                        <img 
                                            src={rel.images?.[0]?.url || '/snitch_editorial_warm.png'} 
                                            alt={rel.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-[14px] mb-1 line-clamp-1">{rel.title}</h3>
                                    <p className="text-[13px] text-[#4d4635]">
                                        {rel.price?.currency || 'INR'} {rel.price?.amount?.toLocaleString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProductDetail;