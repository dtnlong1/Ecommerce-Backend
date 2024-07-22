'use strict'

const discountModel = require("../discount.model")
const { getUnSelectData, getSelectData } = require('../../utils')

const findAllDiscountCodesUnselect = async({
    limit = 50, page = 1, sort = 'ctime',
    filter, unselect, model
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const discounts = await discountModel.find(filter).sort(sortBy).skip(skip).limit(limit).select(getUnSelectData(unselect)).lean()

    return discounts
}

const findAllDiscountCodesSelect = async({
    limit = 50, page = 1, sort = 'ctime',
    filter, select, model
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const discounts = await discountModel.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean()

    return discounts
}

const checkDiscountExists = async({model, filter}) => {
    return await model.findOne(filter).lean()
}

module.exports = {
    findAllDiscountCodesUnselect, findAllDiscountCodesSelect, checkDiscountExists
}