'use strict'

const {product, clothing, electronics} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')

// define Factory class to create product

class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case 'Electronics':
                return new Electronics(payload).createProduct()
            case 'Clothing':
                return new Clothing(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid Product Types ${type}`)
        }
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
        return await product.create({...this, _id: product_id})
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

module.exports = ProductFactory