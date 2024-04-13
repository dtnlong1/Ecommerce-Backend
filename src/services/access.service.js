"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const createTokenPair = require("../auth/authUtils");
const { getInforData } = require("../utils");

const ShopRoles = {
	SHOP: "SHOP",
	WRITER: "WRITER",
	EDITOR: "EDITOR",
	ADMIN: "ADMIN",
};

class AccessService {
	static signUp = async ({ name, email, passsword }) => {
		try {
			// check if email exists
			const holderShop = await shopModel.findOne({ email }).lean();
			if (holderShop) {
				return {
					code: "xxxx",
					message: "Shop already registered!",
				};
			}

			const passwordHash = bcrypt.hash(passsword, 10);
			const newShop = await shopModel.create({
				name,
				email,
				passsword: passwordHash,
				roles: [ShopRoles.SHOP],
			});

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
				const privateKey = crypto.randomBytes(64).toString("hex");
				const publicKey = crypto.randomBytes(64).toString("hex");

				console.log({ privateKey, publicKey });

				const keyStore = await KeyTokenService.createKeyToken({
					userId: newShop._id,
					publicKey,
					privateKey,
				});

				if (!keyStore) {
					return {
						code: "xxxx",
						message: "keyStore error",
					};
				}
			}

			// create token pair
			const tokens = await createTokenPair(
				{ userId: newShop._id, email },
				publicKey,
				privateKey
			);
			console.log(`Create Token Success::`, tokens);

			return {
				code: 201,
				metadata: {
					shop: getInforData({
						fields: ["_id", "name", "email"],
						object: newShop,
					}),
				},
			};
			return {
				code: 200,
				metadata: null,
			};
		} catch (error) {
			return {
				code: "xxxx",
				message: error.message,
				status: "error",
			};
		}
	};
}

module.exports = AccessService;
