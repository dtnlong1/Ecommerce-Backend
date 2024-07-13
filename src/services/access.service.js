'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const {createTokenPair, verifyJWT} = require("../auth/authUtils")
const { getInforData } = require("../utils")
const {BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError} = require('../core/error.response')
const {findByEmail} = require('../services/shop.service')
const ShopRoles = {
	SHOP: 'SHOP',
	WRITER: 'WRITER',
	EDITOR: 'EDITOR',
	ADMIN: 'ADMIN',
}
class AccessService {

    /* 
        check if token has been used
    */

    static handleRefreshTokenV2 = async ({refreshToken,user, keyStore}) => {
        const {userId, email} = user

        if(keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.removeKeyByUserId(userId)
            throw new ForbiddenError('Something is wrong. Please log in again')
        }

        if(keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered')
        }
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registered')
        
        // create new token pair
        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey)

        //update tokens
        await keyStore.updateOne({
            $set: {
                refreshToken:tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user,
            tokens
        }
    }
        
    static handleRefreshToken = async (refreshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        // if token has been used
        if(foundToken) {
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({userId, email})
            //delete all tokens
            await KeyTokenService.removeKeyByUserId(userId)
            throw new ForbiddenError('Something is wrong. Please log in again')
        }
        //if not
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken) throw new AuthFailureError('Shop not registered')

        
        //verify token
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registered')
        
        // create new token pair
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        //update tokens
        await holderToken.updateOne({
            $set: {
                refreshToken:tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user: {userId, email},
            tokens
        }
    }


    static logOut = async(keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }

    static logIn = async ({email, password, refreshToken}) => {
        // 1. check if shop exists
        const foundShop = await findByEmail({email})
        if(!foundShop) {
            throw new BadRequestError('Shop not registered')
        }
        // 2. check password
        const match = await bcrypt.compare(password, foundShop.password)
		if (!match) {
            throw new AuthFailureError('Authentication error')}
        // 3. create privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        // 4. generate tokens
        const tokens = await createTokenPair({userId: foundShop._id, email}, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId: foundShop._id
        })
        return {
            shop: getInforData({fields: ['_id', 'name', 'email'], object: foundShop}),
                tokens
        }
    }

    static signUp = async ({name, email, password}) => {
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
    }
}

module.exports = AccessService