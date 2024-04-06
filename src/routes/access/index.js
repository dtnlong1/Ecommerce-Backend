"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");

//signUp
router.post("/shop/signup", accessController.signUp);

module.exports = router;
