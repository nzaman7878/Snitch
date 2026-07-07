import { createProduct, getSellerProduct, getAllProducts, getProductById, addProductVariant, deleteProduct, updateProduct, updateVariantStock, deleteProductVariant, updateProductVariant } from "../service/product.api"
import { useDispatch } from "react-redux"
import { setSellerProducts, setProducts } from "../state/product.slice"



export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct(params = {}) {
        const data = await getSellerProduct(params)
        dispatch(setSellerProducts(data.products))
        return {
            products: data.products,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            totalItems: data.totalItems
        }
    }

    async function handleGetAllProducts(params = {}) {

        const data = await getAllProducts(params)
        dispatch(setProducts({
            products: data.products,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            totalItems: data.totalItems
        }))
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data
    }

    async function handleDeleteProduct(productId) {
        const data = await deleteProduct(productId);
        return data;
    }

    async function handleUpdateProduct(productId, productData) {
        const data = await updateProduct(productId, productData);
        return data;
    }

    async function handleUpdateVariantStock(productId, variantId, stock) {
        const data = await updateVariantStock(productId, variantId, stock);
        return data;
    }

    async function handleDeleteProductVariant(productId, variantId) {
        const data = await deleteProductVariant(productId, variantId);
        return data;
    }

    async function handleUpdateProductVariant(productId, variantId, variantData) {
        const data = await updateProductVariant(productId, variantId, variantData);
        return data;
    }

    return { 
        handleCreateProduct, 
        handleGetSellerProduct, 
        handleGetAllProducts, 
        handleGetProductById, 
        handleAddProductVariant,
        handleDeleteProduct,
        handleUpdateProduct,
        handleUpdateVariantStock,
        handleDeleteProductVariant,
        handleUpdateProductVariant
    }

}