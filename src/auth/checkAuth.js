"use strict";

const HEADER = {
	API_KEY: "x-api-key",
	AUTHORIZATION: "authorization",
};

const { findById } = require("../services/apikey.service");

const apiKey = async (req, res, next) => {
	try {
		const key = req.headers[HEADER.API_KEY]?.toString();
		if (!key) {
			res.status(403).json({
				message: "Forbidden Error",
			});
		}
		const objKey = await findById(key);
		if (!objKey) {
			res.status(403).json({
				message: "Forbidden Error",
			});
		}
		req.objKey = objKey;
		return next();
	} catch (error) {}
};

const permisson = (permission) => {
	return (req, res, next) => {
		if (!req.objKey.permissions) {
			res.status(403).json({
				message: "Permission Denied",
			});
		}
		const validPermission = req.objKey.permissions.includes(permission);
		if (!validPermission) {
			res.status(403).json({
				message: "Permission Denied",
			});
		}
		return next();
	};
};

const asyncHandler = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};

module.exports = { permisson, apiKey, asyncHandler };
