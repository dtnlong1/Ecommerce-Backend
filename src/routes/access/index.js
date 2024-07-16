'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helper/asyncHandler')
const { authentication, authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

//signUp
router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.logIn))

// authentication
router.use(authenticationV2)

//logOut
router.post('/shop/logout', asyncHandler(accessController.logOut))
router.post('/shop/handleRefreshToken', asyncHandler(accessController.handleRefreshToken))

module.exports = router