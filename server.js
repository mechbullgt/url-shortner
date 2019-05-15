'use strict';
require('dotenv').config();
var express = require('express');
var app = express();

var dns = require('dns');

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
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: Number,
        required: false,
        default: 0
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
        original_url: websiteName,
        short_url: count
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
    res.json({ greeting: 'hello API' })
});

app.post('/api/shorturl/new', (req, res) => {
    console.log('Req body:', req.body);
    let websiteName1 = req.body['url'];
    let websiteName = websiteName1.replace(/(^\w+:|^)\/\//, '')
    // console.log('websiteName 1:', websiteName);

    async function lookupPromise() {
        return new Promise((resolve, reject) => {
            dns.lookup(websiteName, (err, address, family) => {
                console.log('websiteName 2:', websiteName);
                console.log('address :', address);
                if (err) reject(err);
                resolve(address);
            });
        });
    };

    (async function getAddress() {
        try {
            const address = await lookupPromise();
            console.log("Found valid address");
            console.log('address: %j', address);
            createAndSaveShortUrl(websiteName, handlerForCreateSave);
            res.json({
                original_url: websiteName,
                short_url: count
            });
            count++;
        } catch (err) {
            console.log("Error: ", err);
            console.log("Found invalid address");
            res.json({
                error: "invalid url"
            })
        };
    })();
});

function getTheLatestWebsite(webKey){
    return ShortURL.find({'short_url':webKey}).sort({'timestamp':-1}).limit(1).exec();
}

app.get('/api/shorturl/:key', (req, res) => {
    // console.log('req :', req);
    console.log("Calling Key API");
    console.log("Req params: ", req['params']);
    let webKey = req['params']['key'];
    console.log('webKey :', webKey);
    getTheLatestWebsite(webKey).then((data)=>{
        console.log('data',data);
        let site = data[0]['original_url'];
        console.log('site :', site);
        /** Used the res.json to test the response, now redirecting */
        // res.json({
        //     'success':site
        // });
        // Need to add the protocol for the redirects
        res.status(301).redirect(req.protocol+"://"+site);
        res.end();
    }).catch((err)=>{
        console.log("Error occured while searching");
    });
});

app.listen(port, function () {
    console.log('Node.js listening at: ', port);
});