'use strict'

const express = require('express')
const discountController = require('../../controllers/discount.controller')
const { asyncHandler } = require('../../helper/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get('/list-product-code', asyncHandler(discountController.getAllDiscountCodesWithProducts))

router.use(authenticationV2)

router.post('', asyncHandler(discountController.createDiscountCode))
router.get('', asyncHandler(discountController.getAllDiscountCodes))


module.exports = router