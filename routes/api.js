// author.js - Author route module
var express = require('express');
var ibmdb = require('ibm_db');
var router = express.Router();

var feedbackServices  = require('../services/api/feedbackServices');

//REST API
router.get('/data/', function(req, res){

    feedbackServices.getFeedback().then(function (result){
        res.send(result);  
    }); 
})

  module.exports = router;