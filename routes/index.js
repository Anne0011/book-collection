var express = require('express');
var router = express.Router();
var UserController = require('../userController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: "Add a Book to Your Collection",
  	username: UserController.getCurrentUser().username,
  	item_props: {} });
});

module.exports = router;
