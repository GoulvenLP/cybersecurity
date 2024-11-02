const express = require("express");
const router = express.Router();
const controller = require('../controller/Controller');


router.get("/*", controller.checkGETRequest);

//router.post("/*", controller.checkPOSTRequest);

module.exports = router;