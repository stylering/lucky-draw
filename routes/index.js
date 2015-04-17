var express=require('express');
var staff = require('../models/staff');
var router=express.Router();//从express中取出router对象

router.get('/', function (req, res) {
   res.render('index');
});

router.post('/staff', function(req, res) {
	var staffInfo = staff.getInfo('./assets/pic/min');
	res.send(staffInfo);
})
  
module.exports = router;

