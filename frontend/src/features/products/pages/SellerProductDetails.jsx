import React, { useEffect, useState } from 'react'
import { useProduct } from '../hooks/useProduct';
import { useParams, useNavigate } from 'react-router';
import toast from 'react-hot-toast';

// Helper icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const SellerProductDetails = () => {
  const [ product, setProduct ] = useState(null);
  const [ localVariants, setLocalVariants ] = useState([]);
  const [ isAddingVariant, setIsAddingVariant ] = useState(false);
  const [ loading, setLoading ] = useState(true);

  // UI state for inputs to maintain focus
  const [ attributeInputs, setAttributeInputs ] = useState([ { key: '', value: '' } ]);

  // New variant state
  const [ newVariant, setNewVariant ] = useState({
    images: [],
    stock: 0,
    size: '',
    color: '',
    sku: '',
    attributes: {}, // For extra/custom fields
    price: { amount: '', currency: 'INR' }
  });

  const [ isEditingBase, setIsEditingBase ] = useState(false);
  const [ editBaseForm, setEditBaseForm ] = useState({});

  const [ editingVariantId, setEditingVariantId ] = useState(null);
  const [ editVariantForm, setEditVariantForm ] = useState({});

  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleAddProductVariant, handleDeleteProduct, handleUpdateVariantStock, handleUpdateProduct, handleDeleteProductVariant } = useProduct();

  async function fetchProductDetails() {
    setLoading(true);
    try {
      const data = await handleGetProductById(productId);
      const prod = data?.product || data;
      setProduct(prod);
      // Initialize variants locally
      if (prod?.variants) {
        setLocalVariants(prod.variants);
      }
      setEditBaseForm({
        title: prod.title || '',
        description: prod.description || '',
        brand: prod.brand || '',
        category: prod.category || '',
        discount: prod.discount || 0,
        stock: prod.stock || 0,
        priceAmount: prod.price?.amount || '',
        priceCurrency: prod.price?.currency || 'INR',
        collections: prod.collections || []
      });
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductDetails();
  }, [ productId ]);

  // Handlers for modifying existing variant stock natively
  const handleStockChange = (index, newStock) => {
    const updatedVariants = [ ...localVariants ];
    updatedVariants[ index ] = { ...updatedVariants[ index ], stock: Number(newStock), _isDirty: true };
    setLocalVariants(updatedVariants);
  };

  const handleSaveStock = async (variantId, stock) => {
    try {
      await handleUpdateVariantStock(productId, variantId, stock);
      toast.success("Stock updated successfully");
      fetchProductDetails(); // Refresh to reset dirty state and get updated version
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update stock");
    }
  };

  const confirmDeleteProduct = async () => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await handleDeleteProduct(productId);
        toast.success("Product deleted successfully");
        navigate("/seller/dashboard");
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleBaseEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'collections') {
      setEditBaseForm(prev => {
        const current = prev.collections;
        if (checked) return { ...prev, collections: [...current, value] };
        return { ...prev, collections: current.filter(c => c !== value) };
      });
    } else {
      setEditBaseForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveBaseEdit = async () => {
    try {
      await handleUpdateProduct(productId, editBaseForm);
      toast.success("Product updated successfully");
      setIsEditingBase(false);
      fetchProductDetails();
    } catch (err) {
      console.error("Update Product Error:", err);
      toast.error(err.response?.data?.message || "Failed to update product details");
    }
  };

  const handleRemoveVariant = async (variantId) => {
      if(window.confirm("Are you sure you want to delete this variant?")) {
          try {
              await handleDeleteProductVariant(productId, variantId);
              toast.success("Variant deleted successfully");
              fetchProductDetails();
          } catch(err) {
              toast.error("Failed to delete variant");
          }
      }
  };

  const { handleUpdateProductVariant } = useProduct();

  const handleEditVariantClick = (variant) => {
      setEditingVariantId(variant._id);
      setEditVariantForm({
          size: variant.size || '',
          color: variant.color || '',
          sku: variant.sku || '',
          priceAmount: variant.price?.amount || '',
          stock: variant.stock || 0
      });
  };

  const handleEditVariantChange = (e) => {
      const { name, value } = e.target;
      setEditVariantForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveVariantEdit = async () => {
      try {
          await handleUpdateProductVariant(productId, editingVariantId, editVariantForm);
          toast.success("Variant updated successfully");
          setEditingVariantId(null);
          fetchProductDetails();
      } catch (err) {
          console.error("Variant Edit Error:", err);
          toast.error(err.response?.data?.message || "Failed to update variant");
      }
  };

  // Handlers for New Variant Form
  const handleAddNewVariant = async () => {
    // Validate required at least one attribute to be filled
    const hasValidAttribute = attributeInputs.some(attr => attr.key.trim() && attr.value.trim());
    if (!hasValidAttribute) {
      alert("At least one valid attribute is required.");
      return;
    }

    // Maps preview URL so the variant list can display the image locally
    const cleanImages = newVariant.images.map(img => ({ url: img.previewUrl, file: img.file }));

    // Attributes is already an object in newVariant, just use it safely
    const cleanAttributes = { ...newVariant.attributes };

    const variantToSave = {
      images: cleanImages,
      stock: Number(newVariant.stock),
      size: newVariant.size,
      color: newVariant.color,
      sku: newVariant.sku,
      attributes: cleanAttributes,
      price: newVariant.price.amount
        ? Number(newVariant.price.amount)
        : undefined // price is optional
    };

    setLocalVariants([ ...localVariants, variantToSave ]);
    setIsAddingVariant(false);

    await handleAddProductVariant(productId, variantToSave)

    // Reset form
    // Note: should ideally revoke old object URLs as well to prevent memory leaks if it were a long-lived SPA
    setAttributeInputs([ { key: '', value: '' } ]);
    setNewVariant({
      images: [],
      stock: 0,
      size: '',
      color: '',
      sku: '',
      attributes: {},
      price: { amount: '', currency: 'INR' }
    });
  };

  const handleAddAttribute = () => {
    setAttributeInputs(prev => [ ...prev, { key: '', value: '' } ]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedInputs = [ ...attributeInputs ];
    updatedInputs[ index ][ field ] = value;
    setAttributeInputs(updatedInputs);

    // Synchronize to object format
    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[ attr.key.trim() ] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleRemoveAttribute = (index) => {
    const updatedInputs = attributeInputs.filter((_, i) => i !== index);
    setAttributeInputs(updatedInputs);

    // Synchronize to object format
    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[ attr.key.trim() ] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const availableSlots = 7 - newVariant.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(`You can only upload up to 7 images. ${filesToAdd.length} added.`);
    }

    const newImageObjects = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setNewVariant(prev => ({
      ...prev,
      images: [ ...prev.images, ...newImageObjects ]
    }));

    // Clear the input so identical files can be selected again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = newVariant.images[ index ];
    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const updatedImages = newVariant.images.filter((_, i) => i !== index);
    setNewVariant(prev => ({ ...prev, images: updatedImages }));
  };

  if (loading) {
    return <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">Loading gallery...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">Product Not Found</div>;
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] font-sans pb-24">
      {/* Top Banner / Header */}
      <header className="sticky top-0 z-10 bg-[#fbf9f6]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl tracking-wide uppercase">{product.title?.substring(0, 20)}{product.title?.length > 20 ? '...' : ''}</h1>
        <button 
          onClick={confirmDeleteProduct}
          className="text-[#ba1a1a] hover:text-[#ffdad6] hover:bg-[#ba1a1a] px-4 py-2 uppercase text-sm tracking-widest transition-colors flex items-center gap-2"
        >
          <TrashIcon /> Delete Product
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-8">

        {/* Base Product Info */}
        <section className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="w-full md:w-1/2">
            {/* Gallery placeholder */}
            <div className="w-full aspect-[4/5] bg-[#f5f3f0] overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[ 0 ].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#7f7668]">No Image</div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {product.images.slice(1).map((img, i) => (
                  <img key={i} src={img.url} alt={`Thumb ${i}`} className="w-16 h-20 object-cover bg-[#f5f3f0] shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {isEditingBase ? (
              <div className="bg-[#ffffff] p-6 shadow-sm border border-[#f5f3f0] space-y-4">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-1 block">Title</label>
                    <input type="text" name="title" value={editBaseForm.title} onChange={handleBaseEditChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-1 block">Description</label>
                    <textarea name="description" value={editBaseForm.description} onChange={handleBaseEditChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] resize-none" rows="2" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-1 block">Brand</label>
                        <input type="text" name="brand" value={editBaseForm.brand} onChange={handleBaseEditChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-1 block">Category</label>
                        <input type="text" name="category" value={editBaseForm.category} onChange={handleBaseEditChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-1 block">Price</label>
                        <input type="number" name="priceAmount" value={editBaseForm.priceAmount} onChange={handleBaseEditChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-1 block">Discount (%)</label>
                        <input type="number" name="discount" value={editBaseForm.discount} onChange={handleBaseEditChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#7A6E63] mb-2 block">Collections</label>
                    <div className="flex flex-wrap gap-3">
                        {["Men's Collection", "Women's Collection", "New Arrivals", "Best Sellers", "Best Offers"].map(c => (
                            <label key={c} className="flex items-center gap-1 text-xs">
                                <input type="checkbox" name="collections" value={c} checked={editBaseForm.collections.includes(c)} onChange={handleBaseEditChange} className="w-3 h-3 text-[#C9A96E]" /> {c}
                            </label>
                        ))}
                    </div>
                 </div>
                 <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setIsEditingBase(false)} className="text-xs uppercase tracking-wider text-[#7A6E63] hover:text-[#1b1c1a]">Cancel</button>
                    <button onClick={handleSaveBaseEdit} className="bg-[#1b1c1a] text-white px-4 py-2 text-xs uppercase tracking-wider hover:bg-[#C9A96E] transition-colors">Save Details</button>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="font-serif text-4xl md:text-5xl leading-tight uppercase">{product.title}</h2>
                    <button onClick={() => setIsEditingBase(true)} className="text-xs uppercase tracking-widest text-[#7A6E63] hover:text-[#C9A96E] underline underline-offset-4">Edit Details</button>
                </div>
                
                {product.brand && <p className="text-sm uppercase tracking-widest text-[#7A6E63] mb-2">{product.brand}</p>}
                
                <p className="text-[#6e6258] text-lg mb-4 leading-relaxed max-w-md">{product.description}</p>
                
                <div className="flex items-end gap-3 mb-6">
                    <div className="text-2xl tracking-wide font-light">
                    {product.price?.amount} {product.price?.currency}
                    </div>
                    {product.discount > 0 && <span className="text-[#ba1a1a] text-sm mb-1 font-medium">-{product.discount}% OFF</span>}
                </div>

                {product.collections && product.collections.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {product.collections.map(c => (
                            <span key={c} className="bg-[#f5f3f0] px-2 py-1 text-[10px] uppercase tracking-wider text-[#7A6E63]">{c}</span>
                        ))}
                    </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Variants & Inventory */}
        <section className="bg-[#f5f3f0] p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h3 className="font-serif text-3xl uppercase">Variants & Inventory</h3>
            {!isAddingVariant && (
              <button
                onClick={() => setIsAddingVariant(true)}
                className="bg-[#745a27] text-[#ffffff] px-6 py-3 uppercase tracking-wider text-sm hover:bg-[#5a4312] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusIcon /> Add New Variant
              </button>
            )}
          </div>

          {/* Add New Variant Form */}
          {isAddingVariant && (
            <div className="bg-[#ffffff] p-6 md:p-8 mb-12 shadow-[0_20px_40px_rgba(27,28,26,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-serif text-xl uppercase">Create Variant</h4>
                <button
                  onClick={() => setIsAddingVariant(false)}
                  className="text-[#7f7668] hover:text-[#1b1c1a] text-sm uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Left Col: Attributes & Basics */}
                <div className="space-y-6">

                  {/* Standard Variants (Size, Color, SKU) */}
                  <div className="grid grid-cols-3 gap-4">
                      <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#6e6258] mb-1">Size</label>
                          <input type="text" value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} placeholder="e.g. L" className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                      </div>
                      <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#6e6258] mb-1">Color</label>
                          <input type="text" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} placeholder="e.g. Navy" className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                      </div>
                      <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#6e6258] mb-1">SKU</label>
                          <input type="text" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} placeholder="Optional" className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]" />
                      </div>
                  </div>

                  {/* Dynamic Attributes */}
                  <div>
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-3">Attributes (e.g. Size, Color) *</label>
                    <div className="space-y-3">
                      {attributeInputs.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Key (e.g., Size)"
                            value={attr.key}
                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            className="w-1/2 bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., M)"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            className="w-1/2 bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                          />
                          {attributeInputs.length > 1 && (
                            <button onClick={() => handleRemoveAttribute(index)} className="text-[#ba1a1a] p-2 hover:bg-[#ffdad6] transition-colors cursor-pointer">
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddAttribute}
                      className="mt-3 text-[#745a27] text-sm uppercase tracking-wider flex items-center gap-1 hover:text-[#5a4312] cursor-pointer"
                    >
                      <PlusIcon /> Add Attribute
                    </button>
                  </div>

                  {/* Stock & Price */}
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">Initial Stock</label>
                      <input
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                        className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">Price Amount (Optional)</label>
                      <input
                        type="number"
                        value={newVariant.price.amount}
                        onChange={(e) => setNewVariant({ ...newVariant, price: { ...newVariant.price, amount: e.target.value } })}
                        placeholder="Default if empty"
                        className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Right Col: Images */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258]">Image Upload (Max 7, Optional)</label>
                    <span className="text-xs text-[#7f7668]">{newVariant.images.length}/7</span>
                  </div>

                  {newVariant.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {newVariant.images.map((img, index) => (
                        <div key={index} className="relative aspect-[4/5] bg-[#f5f3f0]">
                          <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-white/80 p-1 text-[#ba1a1a] hover:bg-white transition-colors cursor-pointer"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {newVariant.images.length < 7 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-[#6e6258]
                          file:mr-4 file:py-2 file:px-4
                          file:border-0 file:bg-[#f5f3f0] file:text-[#1b1c1a]
                          hover:file:bg-[#e4e2df] file:cursor-pointer file:uppercase file:text-xs file:tracking-wider file:font-serif
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleAddNewVariant}
                  className="bg-gradient-to-r from-[#745a27] to-[#c9a96e] text-[#ffffff] px-8 py-3 uppercase tracking-wider text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Save Variant
                </button>
              </div>
            </div>
          )}

          {/* Variants List */}
          {localVariants.length === 0 ? (
            <div className="py-12 text-center text-[#6e6258]">
              <p>No variants have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {localVariants.map((variant, idx) => (
                <div key={idx} className="bg-[#ffffff] flex flex-col pt-4 shadow-[0_20px_40px_rgba(27,28,26,0.02)]">
                  <div className="px-6 flex gap-4 h-24 mb-4">
                    {/* Variant Thumb */}
                    <div className="w-16 h-20 bg-[#f5f3f0] shrink-0">
                      {variant.images && variant.images.length > 0 ? (
                        <img src={variant.images[ 0 ].url} alt="Variant" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#7f7668]">N/A</div>
                      )}
                    </div>
                    {/* Attributes */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {editingVariantId === variant._id ? (
                        <div className="space-y-2">
                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                  <label className="text-[10px] uppercase text-[#7A6E63] block">Size</label>
                                  <input type="text" name="size" value={editVariantForm.size} onChange={handleEditVariantChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-xs focus:outline-none" />
                               </div>
                               <div>
                                  <label className="text-[10px] uppercase text-[#7A6E63] block">Color</label>
                                  <input type="text" name="color" value={editVariantForm.color} onChange={handleEditVariantChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-xs focus:outline-none" />
                               </div>
                               <div>
                                  <label className="text-[10px] uppercase text-[#7A6E63] block">SKU</label>
                                  <input type="text" name="sku" value={editVariantForm.sku} onChange={handleEditVariantChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-xs focus:outline-none" />
                               </div>
                               <div>
                                  <label className="text-[10px] uppercase text-[#7A6E63] block">Price</label>
                                  <input type="number" name="priceAmount" value={editVariantForm.priceAmount} onChange={handleEditVariantChange} className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-xs focus:outline-none" />
                               </div>
                           </div>
                           <div className="flex justify-end gap-2 mt-2">
                               <button onClick={() => setEditingVariantId(null)} className="text-[10px] uppercase text-[#7A6E63] hover:text-[#1b1c1a]">Cancel</button>
                               <button onClick={handleSaveVariantEdit} className="bg-[#1b1c1a] text-white px-2 py-1 text-[10px] uppercase hover:bg-[#C9A96E]">Save</button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {variant.size && <span className="bg-[#1b1c1a] text-[#ffffff] px-2 py-1 text-[10px] uppercase tracking-wider">Size: {variant.size}</span>}
                            {variant.color && <span className="bg-[#f5f3f0] px-2 py-1 text-[10px] uppercase tracking-wider text-[#1b1c1a]">Color: {variant.color}</span>}
                            {variant.sku && <span className="bg-[#f5f3f0] px-2 py-1 text-[10px] uppercase tracking-wider text-[#1b1c1a]">SKU: {variant.sku}</span>}
                            
                            {Object.entries(variant.attributes || {}).map(([ key, val ]) => (
                              <span key={key} className="bg-[#f5f3f0] px-2 py-1 text-xs uppercase tracking-wider text-[#4d463a]">
                                <span className="text-[#a8a094]">{key}:</span> {val}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between items-end">
                              <div className="text-sm font-medium">
                                {variant.price?.amount ? `${variant.price.amount} ${variant.price.currency}` : 'Base Price'}
                              </div>
                              <div className="flex gap-3">
                                  <button onClick={() => handleEditVariantClick(variant)} className="text-[#7A6E63] text-[10px] uppercase tracking-wider hover:underline">
                                      Edit
                                  </button>
                                  <button onClick={() => handleRemoveVariant(variant._id)} className="text-[#ba1a1a] text-[10px] uppercase tracking-wider hover:underline flex items-center gap-1">
                                      <TrashIcon /> Remove
                                  </button>
                              </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock Management Row */}
                  <div className="mt-auto border-t border-[#f5f3f0] bg-[#fbf9f6] flex flex-col sm:flex-row items-center px-6 py-3 justify-between gap-4">
                    <div className="flex items-center w-full justify-between sm:w-auto sm:justify-start gap-4">
                      <label className="text-sm text-[#6e6258] uppercase tracking-wider">Current Stock</label>
                      <input
                        type="number"
                        value={variant.stock || 0}
                        onChange={(e) => handleStockChange(idx, e.target.value)}
                        className="w-20 bg-transparent border-b border-[#d0c5b5] py-1 text-right focus:outline-none focus:border-[#745a27] font-serif text-lg"
                      />
                    </div>
                    {variant._isDirty && (
                      <button
                        onClick={() => handleSaveStock(variant._id, variant.stock)}
                        className="w-full sm:w-auto bg-[#1b1c1a] text-[#ffffff] px-4 py-2 uppercase tracking-wider text-xs hover:bg-[#C9A96E] hover:text-[#1b1c1a] transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </main>
    </div>
  )
}

export default SellerProductDetails