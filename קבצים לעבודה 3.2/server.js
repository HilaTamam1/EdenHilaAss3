//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var users = require('./server_modules/Users'); // get our users model
var guests = require('./server_modules/Guests');
var auth = require('./server_modules/Auth');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
//const superSecret = "edenANDhila"; // secret variable


app.use(cors());

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//complete your code here
// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/auth', auth);
app.use('/auth/users', users);
app.use('/guests', guests);

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
    app.emit("Hi");
});