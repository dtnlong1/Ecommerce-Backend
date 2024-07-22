'use strict'

const {BadRequestError, NotFoundError} = require('../core/error.response')
const discount = require('../models/discount.model')
const {findAllProducts} = require('../models/repositories/product.repo')
const {findAllDiscountCodesUnselect, checkDiscountExists} = require('../models/repositories/discount.repo')
/*
    Discount Services
    1. Generate discount code
    2.

 */


class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, startDate, endDate, isActive, shopId, minOrderValue,
            productIds, appliesTo, name, description, type, value, maxValue, maxUses, useCount, maxUsesPerUser
        } = payload

        // if(new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
        //     throw new BadRequestError('Invalid discount date')
        // }
        if(new Date(startDate) > new Date(endDate)) {
            throw new BadRequestError('Start date must be before end date')
        }

        const foundDiscount = discount.findOne({
            discount_code: code,
            discount_shopId: shopId
        }).lean()
        if(foundDiscount && foundDiscount.discount_isActive) {
            throw new BadRequestError('Discount exists')
        }
        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(startDate),
            discount_end_date: new Date(endDate),
            discount_max_use: maxUses,
            discount_used_count: useCount,
            discount_user_list: [], 
            discount_max_use_per_user: maxUsesPerUser,
            discount_min_order_value: minOrderValue || 0,
            discount_shopId: shopId,
            discount_isActive: isActive,
            discount_applies_to: appliesTo,
            discount_product_ids: appliesTo === 'all' ? [] : productIds
        })
        return newDiscount
    }

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        const foundDiscount = discount.findOne({
            discount_code: code,
            discount_shopId: shopId
        }).lean()
        if(!foundDiscount || !foundDiscount.discount_isActive) {
            throw new NotFoundError('Discount does not exist')
        }

        const {discount_applies_to, discount_product_ids} = foundDiscount
        if(discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: shopId,
                    isPublish: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        if(discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublish: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    static async getAllDiscountCodesOfShop({limit, page, shopId}) {
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: shopId,
                discount_isActive: true
            },
            unselect: ['__v', 'discount_shopId'],
            model: discount   
        })
        return discounts
    }

    static async getDiscountAmount({codeId, userId, shopId, products}) {
        const foundDiscount = await checkDiscountExists({
            model: discount, 
            filter: {
                discount_code: codeId,
                discount_shopId: shopId
            }
        })
        if(!foundDiscount) throw new NotFoundError('Discount does not exist')

        // check discount valid
        const {discount_isActive, discount_max_use, discount_start_date, discount_end_date, discount_min_order_value, 
            discount_max_use_per_user, discount_type, discount_value
        } = foundDiscount
        if(!discount_isActive) throw new NotFoundError('Discount expired')
        if(!discount_max_use) throw new NotFoundError('Discount invalid')
        if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) throw new NotFoundError('Discount Code has expired')

        let totalOrder = 0
        if(discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)
        }
        if(totalOrder < discount_min_order_value) {
            throw new NotFoundError(`discount requires a minimum order value of ${discount_min_order_value}`)
        }
        if(discount_max_use_per_user > 0) {
            // ...
        }
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    } 
    static async deleteDiscountCode({codeId, shopId}) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: shopId
        })
        return deleted
    }
}
module.exports = DiscountService