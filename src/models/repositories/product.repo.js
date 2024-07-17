'use strict'

const { getSelectData } = require('../../utils')
const {product, electronics, clothing, furniture} = require('../product.model')
const {Types} = require('mongoose')

const findAllDraftsForShop = async({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const findAllPublishForShop = async({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const findAllProducts = async({limit, sort, page, filter, select}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const products = await product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean()
    
    return products
}

const searchProductByUser = async({keySearch}) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        isPublish: true,
        $text: {$search: regexSearch}},
        {score: {$meta: 'textScore'}})
        .sort({score: {$meta: 'textScore'}})
        .lean()
    return results
}

const queryProducts = async({query, limit, skip}) => {
    return await product.find(query).
    populate('product_shop', 'name email -_id')
    .sort({updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

const publishProductByShop = async({product_shop, product_id}) => {
    const filter = { _id: product_id, product_shop: product_shop };
    const update = {
        $set: {
            isDraft: false,
            isPublish: true
        }
    };
    const options = { new: true };
    const result = await product.updateOne(filter, update, options);
    return result.modifiedCount;
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    searchProductByUser,
    findAllProducts
}