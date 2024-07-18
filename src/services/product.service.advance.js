'use strict'

const {product, clothing, electronics, furniture} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')
const { findAllDraftsForShop, publishProductByShop, findAllPublishForShop, searchProductByUser, findAllProducts } = require('../models/repositories/product.repo')
const { insertInventory } = require('../models/repositories/inventory.repo')

// define Factory class to create product

class ProductFactory {

    static productRegistry = {}
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError('Invalid product type')
        return new productClass(payload).createProduct()
    }

    static async updateProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError('Invalid product type')
        return new productClass(payload).createProduct()
    }

    //QUERY
    static async findAllDraftsForShop({product_shop, limit = 0, skip = 0}) {
        const query = {product_shop, isDraft: true}
        return await findAllDraftsForShop({query, limit, skip})
    }
    static async findAllPublishForShop({product_shop, limit = 0, skip = 0}) {
        const query = {product_shop, isPublish: true}
        return await findAllPublishForShop({query, limit, skip})
    }

    static async searchProduct({keySearch}) {
        return await searchProductByUser({keySearch})
    }
    
    static async findAllProducts({limit = 50, sort = 'ctime', page = 1, filter = {isPublish: true}}) {
        return await findAllProducts({limit, sort, page, filter, select: ['product_name', 'product_price', 'product_thumb']})
    }
    
    static async findProduct({keySearch}) {
        return await searchProductByUser({keySearch})
    }

    //PUT
    static async publishProductByShop({product_shop, product_id}) {
        return await publishProductByShop({product_shop, product_id})
    }
}


//define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price, product_type, product_shop, product_attributes, product_quantity
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_quantity = product_quantity
    }
    
    //create new product
    async createProduct(product_id){
        const newProduct = await product.create({...this, _id: product_id})
        if (newProduct) {
            // add product_stock to inventory collection
            await insertInventory({product_id: newProduct._id, shop_id: this.product_shop, stock: this.product_quantity })
        }
        return newProduct
    }
}

//define sub-class for clothing product type
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes)
        if(!newClothing) throw new BadRequestError('Error creating new clothing')
        
        const newProduct = await super.createProduct()
        if(!newProduct) throw new BadRequestError('Error creating new Product')
        
        return newProduct
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronics = await electronics.create({...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronics) throw new BadRequestError('Error creating new Electronics')
        
        const newProduct = await super.createProduct(newElectronics._id)
        if(!newProduct) throw new BadRequestError('Error creating new Product')
        
        return newProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture) throw new BadRequestError('Error creating new Furniture')
        
        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError('Error creating new Product')
        
        return newProduct
    }
}

//register product types
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory