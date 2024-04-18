"use strict";

const express = require("express");
const { apiKey, permisson } = require("../auth/checkauth.js");
const router = express.Router();

//check apiKey
router.use(apiKey);
//check permission
router.use(permisson("0000"));

router.use("/v1/api", require("./access"));

module.exports = router;
