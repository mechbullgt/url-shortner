'use strict';
require('dotenv').config();
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cors = require('cors');
app.use(cors());


// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
    console.log("Success db is now connected");
});

mongoose.connection.on('error', (err) => {
    console.log("Error occured while connecting to the db: ", err);
})

/** this project needs to parse POST bodies **/
function bodyParserMiddleware() {
    console.log("Body Parser Middleware called");
    return bodyParser.urlencoded({
        extended: false
    });
};

// you should mount the body-parser here
app.use('/', bodyParserMiddleware());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Schema -> Model
var shortURLScehma = new Schema({
    website: {
        type: String,
        required: true
    },
    websiteKey: {
        type: Number,
        required: false,
        default:0
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});

var ShortURL = mongoose.model('ShortURL', shortURLScehma, 'webdb');

// Find the latest saved document, and get the websiteKey
// var queryObj;
// var latestKeyValue;
// var queryChain = function(done){
//     var query = ShortURL.find().sort({
//         'timestamp':-1
//     }).limit(1);
//     query.exec((err,data)=>{
//         if(err) done(err)
//         done(null, data);
//     });
// }

// function getLatestWebsiteKey(obj){
//     // console.log('obj :', obj);
//     if(obj===null){
//         console.log("There are no website records, please create a record with websiteKey");
//         return 0;
//     } 
//     let websiteKey = obj[0]['websiteKey'];
//     console.log("getLatestWebsiteKey()");
//     console.log('websiteKey :', websiteKey);
//     return websiteKey;
// }

// function handlerForQueryChain (err, data){
//     if(err){
//         console.log("Error while chain querying:",err);
//         throw err;
//     }
//     console.log("Success chain querying: ",data);
//     queryObj=data;
//     // console.log('queryObj :', queryObj);
//     latestKeyValue = (getLatestWebsiteKey(queryObj));
//     latestKeyValue+=1;
//     console.log('"latestKeyValue after" :', latestKeyValue);
//     return latestKeyValue;
// }
var count = 0;
var createAndSaveShortUrl = function (websiteName, done) {
    // let key;
    // queryChain(handlerForQueryChain).then((err, data)=>{
    //     if(err) console.log("Error query:",err);
    //     key = data;
    // });
    // console.log('key :', key);
    var shortUrl = new ShortURL({
        website: websiteName,
        websiteKey: count
    });
    shortUrl.save((err, data) => {
        if (err) done(err);
        done(null, data);
    });
};

function handlerForCreateSave(err, data) {
    if (err) {
        console.log("Error while creating: ", err);
        throw err;
    }
    console.log("Success creating: ", data);
    return data;
};

// var updateWebsiteKey = function(id,done){
//     ShortURL.findByIdAndUpdate({_id:id},{
//         $inc:{websiteKey:1}},{new:true},(err,data)=>{
//             if(err) done(err);
//             done(null, data);
//         });
// }

// function handlerForUpdateWebsiteKey (err, data){
//     if(err){
//         console.log("Error while updating the key");
//     } 
//     console.log("Success updating the key: ",data);
// }


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
    res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', (req, res) => {
    console.log('Req body:', req.body);
    let websiteName = req.body['website'];
    console.log('websiteName :', websiteName);
    createAndSaveShortUrl(websiteName, handlerForCreateSave);
    res.json({
        website:websiteName,
        websiteKey:count
    });
    count++;
})



app.listen(port, function () {
    console.log('Node.js listening at: ', port);
});