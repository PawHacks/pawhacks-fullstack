const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/', userController.get_home);
router.post('/', userController.post_home);
router.get('/login', userController.view_login)
// router.post('/register', userController.post_register);
router.get('/application', userController.view_application)
router.post('/application', userController.submit_application)
router.get('/create_team', userController.view_create_team)
router.post('/create_team', userController.submit_create_team)
router.post('/add_team_members', userController.add_team_members)
// router.post('/', userController.find);
// router.get('/adduser', userController.form);
// router.post('/adduser', userController.create);
// router.get('/edituser/:id', userController.edit);
// router.post('/edituser/:id', userController.update);
// router.get('/viewuser/:id', userController.viewall);
// router.get('/:id',userController.delete);
  
module.exports = router;