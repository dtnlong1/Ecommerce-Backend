'use strict'

const AccessService = require('../services/access.service')

const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {
	login = async (req, res, next) => {
		new SuccessResponse({
			metadata: await AccessService.login(req.body),
		})
	}
	signUp = async (req, res, next) => {
		new CREATED({
			message: 'Registered OK!',
			metadata: await AccessService.signUp(req.body),
		}).send(res)
	}
}

module.exports = new AccessController()
