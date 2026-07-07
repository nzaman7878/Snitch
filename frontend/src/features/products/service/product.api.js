import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)

    return response.data
}

export async function getSellerProduct(params = {}) {
    const response = await productApiInstance.get("/seller", { params })
    return response.data
}

export async function getAllProducts(params = {}) {
    const response = await productApiInstance.get("/", { params })
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function addProductVariant(productId, newProductVariant) {

    console.log(newProductVariant)

    const formData = new FormData()

    newProductVariant.images.forEach((image) => {
        formData.append(`images`, image.file)
    })

    formData.append("stock", newProductVariant.stock)
    formData.append("priceAmount", newProductVariant.price)
    
    if (newProductVariant.size) formData.append("size", newProductVariant.size)
    if (newProductVariant.color) formData.append("color", newProductVariant.color)
    if (newProductVariant.sku) formData.append("sku", newProductVariant.sku)
    
    formData.append("attributes", JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`, formData)

    return response.data

}

export async function deleteProduct(productId) {
    const response = await productApiInstance.delete(`/${productId}`)
    return response.data
}

export async function updateProduct(productId, productData) {
    const response = await productApiInstance.put(`/${productId}`, productData)
    return response.data
}

export async function updateVariantStock(productId, variantId, stock) {
    const response = await productApiInstance.put(`/${productId}/variants/${variantId}/stock`, { stock })
    return response.data
}

export async function deleteProductVariant(productId, variantId) {
    const response = await productApiInstance.delete(`/${productId}/variants/${variantId}`)
    return response.data
}

export async function updateProductVariant(productId, variantId, variantData) {
    const response = await productApiInstance.put(`/${productId}/variants/${variantId}`, variantData)
    return response.data
}