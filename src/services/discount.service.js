'use strict'

const {BadRequestError} = require('../core/error.response')
const discount = require('../models/discount.model')

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

        if(new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
            throw new BadRequestError('Invalid discount date')
        }
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
}