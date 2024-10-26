const express = require("express");
const router = express.Router();
const controller = require('../controller/Controller');


router.get("/*", controller.checkUrl);


module.exports = router;