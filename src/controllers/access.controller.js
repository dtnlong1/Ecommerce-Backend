'use strict'

const AccessService = require('../services/access.service')

const {OK, CREATED, SuccessResponse} = require('../core/success.response')

class AccessController {
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