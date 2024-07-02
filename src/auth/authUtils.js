'use strict'

const JWT = require('jsonwebtoken')
const  asyncHandler  = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
	API_KEY: 'x-api-key',
	CLIENT_ID: 'x-client-id',
	AUTHORIZATION: 'authorization',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
	try {
		// accessToken
		const accessToken = await JWT.sign(payload, publicKey, {
			expiresIn: '2 days',
		})

		const refreshToken = await JWT.sign(payload, privateKey, {
			expiresIn: '2 days',
		})

		//
		return { accessToken, refreshToken }
	} catch (error) {}
}

const authentication = asyncHandler(async (req, res, next) => {
	/*
		1. Check userId missing?
		2. Get accessToken
		3. Verify token
		4. Check user in dbs
		5. Check keyStore with this userId
		6. Return next
	*/

	const userId = req.headers[HEADER.CLIENT_ID]
	if (!userId) throw new AuthFailureError('Invalid Request')

	const keyStore = await findByUserId(userId)
	if (!keyStore) throw new NotFoundError('keyStore not found')

	const accessToken = req.headers[HEADER.AUTHORIZATION]
	if (!accessToken) throw new AuthFailureError('Invalid Request')

	try {
		const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
		if (userId !== decodeUser.userId)
			throw new AuthFailureError('Invalid userId')
		req.keyStore = keyStore
		return next()
	} catch (error) {
		throw error
	}
})

module.exports = { createTokenPair, authentication }
