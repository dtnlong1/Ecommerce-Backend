'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const createTokenPair = require('../auth/authUtils')
const { getInforData } = require('../utils')
const {
	BadRequestError,
	ConflictRequestError,
	AuthFailureError,
} = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const ShopRoles = {
	SHOP: 'SHOP',
	WRITER: 'WRITER',
	EDITOR: 'EDITOR',
	ADMIN: 'ADMIN',
}

class AccessService {

	static logout = async (keyStore) => {
		return delKey = await KeyTokenService.removeById(keyStore._id)
	}


	/*
	1 - check email in dbs
	2 - match password
	3 - create accesstoken and refreshtoken and save
	4 - generate tokens
	5 - get data return login 
	*/
	static login = async ({ email, password, refreshToken = null }) => {
		const foundShop = await findByEmail({ email })
		if (!foundShop) throw new BadRequestError('Shop not registered!')

		const match = bcrypt.compare(password, foundShop.passsword)
		if (!match) throw new AuthFailureError('Authentication error')

		const privateKey = crypto.randomBytes(64).toString('hex')
		const publicKey = crypto.randomBytes(64).toString('hex')
		const { _id: userId } = foundShop
		const tokens = await createTokenPair(
			{ userId: userId, email },
			publicKey,
			privateKey
		)
		await KeyTokenService.createKeyToken({
			refreshToken: tokens.refreshToken,
			privateKey,
			publicKey,
			userId,
		})
		return {
			shop: getInforData({
				fields: ['_id', 'name', 'email'],
				object: foundShop,
			}),
			tokens,
		}
	}

	static signUp = async ({ name, email, passsword }) => {
		try {
			// check if email exists
			const holderShop = await shopModel.findOne({ email }).lean()
			if (holderShop) {
				throw new BadRequestError('Error: Shop already registered!')
			}

			const passwordHash = bcrypt.hash(passsword, 10)
			const newShop = await shopModel.create({
				name,
				email,
				passsword: passwordHash,
				roles: [ShopRoles.SHOP],
			})

			if (newShop) {
				// create privateKey, publicKey
				// const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
				// 	modulusLength: 4096,
				// 	publicKeyEncoding: {
				// 		type: "pkcs1",
				// 		format: "pem",
				// 	},
				// 	privateKeyEncoding: {
				// 		type: "pkcs1",
				// 		format: "pem",
				// 	},
				// });
				const privateKey = crypto.randomBytes(64).toString('hex')
				const publicKey = crypto.randomBytes(64).toString('hex')

				console.log({ privateKey, publicKey })

				const keyStore = await KeyTokenService.createKeyToken({
					userId: newShop._id,
					publicKey,
					privateKey,
				})

				if (!keyStore) {
					throw new BadRequestError('Error: Shop already registered!')
				}
			}

			// create token pair
			const tokens = await createTokenPair(
				{ userId: newShop._id, email },
				publicKey,
				privateKey
			)
			console.log(`Create Token Success::`, tokens)

			return {
				code: 201,
				metadata: {
					shop: getInforData({
						fields: ['_id', 'name', 'email'],
						object: newShop,
					}),
				},
			}
			return {
				code: 200,
				metadata: null,
			}
		} catch (error) {
			return {
				code: 500,
				message: error.message,
				status: 'error',
			}
		}
	}
}

module.exports = AccessService
