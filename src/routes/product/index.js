'use strict'

const express = require('express')
const productController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../helper/asyncHandler')
const { authentication, authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()


// authentication
router.use(authenticationV2)

//logOut
router.post('', asyncHandler(productController.createProduct))

module.exports = router