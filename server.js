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

var count = 0;
var createAndSaveShortUrl = function (websiteName, done) {
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

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
    res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', (req, res) => {
    console.log('Req body:', req.body);
    let websiteName = req.body['url'];
    console.log('websiteName :', websiteName);
    createAndSaveShortUrl(websiteName, handlerForCreateSave);
    res.json({
        website:websiteName,
        websiteKey:count
    });
    count++;
});

var site;
app.get('/api/shorturl/:key',(req, res)=>{
    console.log("Req params: ",req.params);
    let webKey = req.params['key'];
    var getTheWebsite = function(webKey,done){
        ShortURL.find({
            websiteKey:webKey
        }, (err, data)=>{
            if(err) done(err)
            done(null, data);
        });
    };
    function handlerForGetWebsite(err, data){
        if(err){
            console.log("Error while getting:", err);
        } 
        site = data[0]['website'];
        console.log('site :', site);
        console.log("Success GETting:",data);
        /** It works */
        // res.json({
        //     website:site
        // });    
        res.redirect(site);
    };
    getTheWebsite(webKey, handlerForGetWebsite);
})

app.listen(port, function () {
    console.log('Node.js listening at: ', port);
});