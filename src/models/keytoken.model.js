'use strict'

const { Schema, model } = require('mongoose')

const DOC_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

var keyTokenSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Shop',
		},
		privateKey: {
			type: String,
			required: true,
		},
		publicKey: {
			type: String,
			required: true,
		},
		// refreshTokensUsed: {
		// 	type: Array,
		// 	default: [],
		// },
		refreshToken: {
			type: String,
			default: []
		},
	},
	{
		collection: COLLECTION_NAME,
		timestamps: true,
	}
)

module.exports = model(DOC_NAME, keyTokenSchema)