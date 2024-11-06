const express = require('express');
const router = express.Router();
const managersController = require('../controller/ManagersController');


// router.post('/login', managersController.connect);
router.get('/logout', managersController.disconnect);

router.post('/create', managersController.createUser);
router.get('/account', managersController.getUsers);
router.get('/account/:id', managersController.getUser);
router.put('/update/:id', managersController.updateUser);
router.delete('/delete/:id', managersController.deleteUser);


module.exports = router;