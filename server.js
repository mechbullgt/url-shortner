'use strict';
require('dotenv').config();
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');
app.use(cors());


// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true});

mongoose.connection.on('connected',()=>{
console.log("Success db is now connected");
});

mongoose.connection.on('error',(err)=>{
    console.log("Error occured while connecting to the db: ", err);
})

/** this project needs to parse POST bodies **/
function bodyParserMiddleware(){
    console.log("Body Parser Middleware called");
    return bodyParser.urlencoded({
        extended:false
    });
};

// you should mount the body-parser here
app.use('/',bodyParserMiddleware());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening at: ', port);
});