const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getDetailUser);
router.patch('/users/:id', userController.editUser);
router.delete('/users/:id', userController.deletUser);

module.exports = router;