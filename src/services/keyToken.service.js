'use strict'

const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {
    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try {
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey, privateKey
            // })
            // return tokens ? tokens.publicKey : null
            const filter = {user: userId}
            const update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }
            const options = {upsert: true, new: true}
            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
            return tokens ? tokens.publicKey : null
        } catch (error) {
            console.error('Error in createKeyToken:', error);
            return error
        }
    }
}

module.exports = KeyTokenService