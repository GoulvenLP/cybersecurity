const express = require('express');
const router = express.Router();
const managersController = require('../controller/ManagersController');
const { authenticateToken } = require('../utils/middlewares');
const { checkGETRequest } = require('../controller/CyberController');


router.post('/login', managersController.connect);

//checkGETRequest,
router.get('/account/:id', authenticateToken, managersController.getUser);
router.get('/logout', authenticateToken, managersController.disconnect);

router.post('/create', managersController.createUser);
router.delete('/delete/:id', managersController.deleteUser);


module.exports = router;