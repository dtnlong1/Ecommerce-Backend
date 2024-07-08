'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const createTokenPair = require("../auth/authUtils")
const { getInforData } = require("../utils")
const {BadRequestError, ConflictRequestError} = require('../core/error.response')
const ShopRoles = {
	SHOP: 'SHOP',
	WRITER: 'WRITER',
	EDITOR: 'EDITOR',
	ADMIN: 'ADMIN',
}
class AccessService {
    static signUp = async ({name, email, password}) => {
        // try {
            const holderShop = await shopModel.findOne({email}).lean()
            if(holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }
            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [ShopRoles.SHOP]
            })
            let privateKey, publicKey;
            if(newShop) {
                // create privateKey, publicKey
                // const keyPair  = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })
                privateKey = crypto.randomBytes(64).toString('hex')
                publicKey = crypto.randomBytes(64).toString('hex')
            }
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if(!keyStore) {
                return {
                    message: 'keyStore error'
                }
            }
            //create token pair
            const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
            return {
                code: 201,
                metadata: {
                    shop: getInforData({fields: ['_id', 'name', 'email'], object: newShop}),
                    tokens
                }
            }
        // } catch (error) {
        //     console.error(error)
        //     return {
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService