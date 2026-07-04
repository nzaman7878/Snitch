import React, { useState } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useNavigate } from 'react-router';

const CreateProduct = () => {
    const { handleCreateProduct } = useProduct();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR'
    });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(filesArray);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('priceAmount', formData.priceAmount);
            data.append('priceCurrency', formData.priceCurrency);
            
            images.forEach(image => {
                data.append('images', image);
            });

            await handleCreateProduct(data);
            alert("Product created successfully!");
            navigate("/seller/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to create product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        color: '#1b1c1a',
        borderBottom: '1px solid #d0c5b5',
        fontFamily: "'Inter', sans-serif"
    };

    const handleFocus = (e) => { e.target.style.borderBottomColor = '#C9A96E'; };
    const handleBlur = (e) => { e.target.style.borderBottomColor = '#d0c5b5'; };

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
                <div className="max-w-4xl mx-auto px-8 lg:px-16 xl:px-24 py-16">
                    {/* Top Bar */}
                    <div className="mb-10 flex items-center gap-5">
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

                    <div className="mb-12">
                        <p
                            className="text-[10px] uppercase tracking-[0.22em] mb-4 font-medium"
                            style={{ color: '#C9A96E' }}
                        >
                            Seller Portal
                        </p>
                        <h1
                            className="text-4xl xl:text-5xl font-light leading-[1.1]"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Create New Listing
                        </h1>
                        <div className="mt-4 w-14 h-px" style={{ backgroundColor: '#C9A96E' }} />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-9 bg-white p-10 shadow-sm border" style={{ borderColor: '#f0ece6' }}>
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="prod-title"
                                className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: '#7A6E63' }}
                            >
                                Product Title
                            </label>
                            <input
                                id="prod-title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Classic Overcoat"
                                className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="prod-desc"
                                className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: '#7A6E63' }}
                            >
                                Description
                            </label>
                            <textarea
                                id="prod-desc"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="3"
                                placeholder="Details about this product..."
                                className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300 resize-none"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="prod-price"
                                className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: '#7A6E63' }}
                            >
                                Price (INR)
                            </label>
                            <input
                                id="prod-price"
                                type="number"
                                name="priceAmount"
                                value={formData.priceAmount}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="e.g. 2999"
                                className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>

                        {/* Images */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="prod-images"
                                className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: '#7A6E63' }}
                            >
                                Product Images
                            </label>
                            <input
                                id="prod-images"
                                type="file"
                                name="images"
                                onChange={handleImageChange}
                                multiple
                                accept="image/*"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:uppercase file:tracking-widest file:font-semibold file:bg-[#1b1c1a] file:text-white hover:file:bg-[#C9A96E] hover:file:text-[#1b1c1a] transition-all cursor-pointer"
                            />
                            {images.length > 0 && (
                                <p className="text-xs text-gray-400 mt-2">
                                    {images.length} {images.length === 1 ? 'file' : 'files'} selected
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 mt-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#1b1c1a', color: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
                            onMouseEnter={e => {
                                if(!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = '#C9A96E';
                                    e.currentTarget.style.color = '#1b1c1a';
                                }
                            }}
                            onMouseLeave={e => {
                                if(!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = '#1b1c1a';
                                    e.currentTarget.style.color = '#fbf9f6';
                                }
                            }}
                        >
                            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateProduct;