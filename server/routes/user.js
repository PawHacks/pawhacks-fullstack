const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/', userController.get_home);
router.get('/register', userController.get_register)
router.post('/register', userController.post_register)
// router.post('/', userController.find);
// router.get('/adduser', userController.form);
// router.post('/adduser', userController.create);
// router.get('/edituser/:id', userController.edit);
// router.post('/edituser/:id', userController.update);
// router.get('/viewuser/:id', userController.viewall);
// router.get('/:id',userController.delete);
  
module.exports = router;