const express = require("express");
const router = express.Router();
const cyberController = require('../controller/CyberController');
const { authenticateToken } = require('../utils/middlewares');

router.delete("/filters/delete/:id", authenticateToken, cyberController.deleteFilter);
router.post("/filters/create", authenticateToken, cyberController.createFilter);
router.put("/filters/:id", authenticateToken, cyberController.updateAFilter);
router.get("/filters", authenticateToken, cyberController.getFilters);
router.get("/*", cyberController.checkGETRequest);              // DEFAULT PATH: NO TOKEN AUTHENTICATION



//router.post("/*", controller.checkPOSTRequest);

module.exports = router;