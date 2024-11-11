const express = require("express");
const router = express.Router();
const cyberController = require('../controller/CyberController');

router.delete("/filters/delete/:id", cyberController.deleteFilter);
router.post("/filters/create", cyberController.createFilter);
router.put("/filters/:id", cyberController.updateAFilter);
router.get("/filters", cyberController.getFilters);


module.exports = router;
