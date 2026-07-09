import mongoose from 'mongoose';
import priceSchema from "./price.schema.js";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    category: {
        type: String,
        default: "Uncategorized"
    },
    collections: {
        type: [String],
        default: []
    },
    brand: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    salesCount: {
        type: Number,
        default: 0
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    price: {
        type: priceSchema,
        required: true
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    variants: [
        {
            images: [
                {
                    url: {
                        type: String,
                        required: true
                    }
                }
            ],
            stock: {
                type: Number,
                default: 0
            },
            size: {
                type: String,
                default: ""
            },
            color: {
                type: String,
                default: ""
            },
            sku: {
                type: String,
                default: ""
            },
            attributes: {
                type: Map,
                of: String
            },
            price: {
                type: priceSchema,
            }
        },

    ]
}, { timestamps: true, optimisticConcurrency: true })

productSchema.index({ title: 'text', description: 'text' })

const productModel = mongoose.model('product', productSchema);

export default productModel;