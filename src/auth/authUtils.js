'use strict'

const jwt = require('jsonwebtoken')

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

module.exports = createTokenPair