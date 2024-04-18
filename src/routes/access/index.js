"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkauth");
const router = express.Router();

//signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));

module.exports = router;
