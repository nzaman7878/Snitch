import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export async function createProduct(req, res) {

    const { title, description, priceAmount, priceCurrency, category, brand, discount, stock, collections } = req.body;
    const seller = req.user;

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))


    const product = await productModel.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        category: category || "Uncategorized",
        collections: collections ? JSON.parse(collections) : [],
        brand: brand || "",
        discount: discount ? Number(discount) : 0,
        stock: stock ? Number(stock) : 0,
        images,
        seller: seller._id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;
    const { page = 1, limit = 10, search } = req.query;

    const query = { seller: seller._id };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await productModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const totalItems = await productModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / Number(limit));

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products,
        currentPage: Number(page),
        totalPages,
        totalItems
    })
}

export async function getAllProducts(req, res) {
    const { page = 1, limit = 10, sort = 'newest', search, category, minPrice, maxPrice } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (category) {
        query.category = category;
    }

    if (minPrice || maxPrice) {
        query['price.amount'] = {};
        if (minPrice) query['price.amount'].$gte = Number(minPrice);
        if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
        sortOption = { 'price.amount': 1 };
    } else if (sort === 'price_desc') {
        sortOption = { 'price.amount': -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await productModel.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

    const totalItems = await productModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / Number(limit));

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products,
        currentPage: Number(page),
        totalPages,
        totalItems
    })
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}


export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const size = req.body.size || ""
    const color = req.body.color || ""
    const sku = req.body.sku || ""
    const attributes = JSON.parse(req.body.attributes || "{}")

    console.log(price)

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        size,
        color,
        sku,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })

}

export async function updateProduct(req, res) {
    const { id } = req.params;
    const { title, description, priceAmount, priceCurrency, category, brand, discount, stock, collections } = req.body;
    
    try {
        const product = await productModel.findOneAndUpdate(
            { _id: id, seller: req.user._id },
            {
                title,
                description,
                category: category || "Uncategorized",
                collections: collections || [],
                brand: brand || "",
                discount: discount ? Number(discount) : 0,
                stock: stock ? Number(stock) : 0,
                "price.amount": priceAmount ? Number(priceAmount) : 0,
                "price.currency": priceCurrency || "INR"
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized", success: false });
        }

        return res.status(200).json({ message: "Product updated successfully", success: true, product });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function deleteProduct(req, res) {
    const { id } = req.params;

    try {
        const product = await productModel.findOneAndDelete({ _id: id, seller: req.user._id });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized", success: false });
        }

        return res.status(200).json({ message: "Product deleted successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function updateVariantStock(req, res) {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    try {
        const product = await productModel.findOne({ _id: productId, seller: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized", success: false });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        variant.stock = Number(stock);
        
        // Let mongoose handle optimistic concurrency control via save
        await product.save();

        return res.status(200).json({ message: "Variant stock updated successfully", success: true, product });
    } catch (error) {
        if (error.name === 'VersionError') {
            return res.status(409).json({ message: "Conflict: Stock was updated by another request. Please try again.", success: false });
        }
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function deleteProductVariant(req, res) {
    const { productId, variantId } = req.params;

    try {
        const product = await productModel.findOne({ _id: productId, seller: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized", success: false });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        product.variants.pull(variantId);
        await product.save();

        return res.status(200).json({ message: "Variant deleted successfully", success: true, product });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function updateProductVariant(req, res) {
    const { productId, variantId } = req.params;
    const { stock, priceAmount, priceCurrency, size, color, sku, attributes } = req.body;

    try {
        const product = await productModel.findOne({ _id: productId, seller: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized", success: false });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        if (stock !== undefined) variant.stock = Number(stock);
        if (size !== undefined) variant.size = size;
        if (color !== undefined) variant.color = color;
        if (sku !== undefined) variant.sku = sku;
        if (priceAmount !== undefined) variant.price.amount = Number(priceAmount);
        if (priceCurrency !== undefined) variant.price.currency = priceCurrency;
        
        if (attributes !== undefined) {
            variant.attributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
        }

        await product.save();

        return res.status(200).json({ message: "Variant updated successfully", success: true, product });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}