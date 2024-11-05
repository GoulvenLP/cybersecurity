const express = require('express');
const router = express.Router();
const managersController = require('../controller/ManagersController');
const { authenticateToken } = require('../utils/middlewares');
const { checkGETRequest } = require('../controller/CyberController');


router.post('/login', managersController.connect);
router.get('/logout', authenticateToken, checkGETRequest, managersController.disconnect);

//checkGETRequest,
router.post('/create', managersController.createUser);
router.get('/account/:id', authenticateToken, checkGETRequest, managersController.getUser);
router.get('/account', authenticateToken, checkGETRequest, managersController.getUsers);
router.put('update/:id', authenticateToken, checkGETRequest, managersController.updateUser);
router.delete('/delete/:id', managersController.deleteUser);


module.exports = router;