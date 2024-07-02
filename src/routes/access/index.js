'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../auth/checkauth')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

//signUp
router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.login))
router.post('/shop/logout', asyncHandler(accessController.logout))
// authentication //
router.use(authentication)

module.exports = router
