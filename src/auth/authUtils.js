'use strict'

const jwt = require('jsonwebtoken')
const { asyncHandler } = require('../helper/asyncHandler')

const {AuthFailureError, NotFoundError} = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = jwt.sign(payload, publicKey, {
            expiresIn: '2 days',
        })
        const refreshToken = jwt.sign(payload, privateKey, {
            expiresIn: '7 days',
        })

        jwt.verify(accessToken, publicKey, (err, decode) => {
            if(err){
                console.error('error verify', err)
            }
            else{
                console.log('decode verify::', decode)
            }   
        })

        return {accessToken, refreshToken}
    } catch (error) {
        return error
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
    1. check userId missing?
    2. get accessToken
    3. verify token
    4. check user in dbs
    5. check keyStore with this userId
    6. return next
    */
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')

    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not Found keyStore')
    
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User ID')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

const verifyJWT = async (token, keySecret) => {
    return await jwt.verify(token, keySecret)
}

module.exports = {createTokenPair, authentication, verifyJWT}