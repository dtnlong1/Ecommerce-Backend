'use strict'

const AccessService = require('../services/access.service')

const {OK, CREATED, SuccessResponse} = require('../core/success.response')

class AccessController {

	handleRefreshToken = async (req, res, next) => {
		// new SuccessResponse({
		// 	message: 'Get token success',
		// 	metadata: await AccessService.handleRefreshToken( req.body.refreshToken)
		// }).send(res)

		new SuccessResponse({
			message: 'Get token success',
			metadata: await AccessService.handleRefreshTokenV2( {
				refreshToken: req.refreshToken,
				user: req.user,
				keyStore: req.keyStore
			})
		}).send(res)
	}

	logOut = async (req, res, next) => {
		new SuccessResponse({
			message: 'Logout success',
			metadata: await AccessService.logOut( req.keyStore)
		}).send(res)
	}
	logIn = async (req, res, next) => {
		new SuccessResponse({
			metadata: await AccessService.logIn(req.body)
		}).send(res)
	}
	signUp = async (req, res, next) => {
		new CREATED({
			message: 'Registered OK',
			metadata: await AccessService.signUp(req.body)
		}).send(res)
	}
}

module.exports = new AccessController()