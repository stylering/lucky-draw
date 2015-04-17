var express = require('express');
var http = require('http');
var path = require('path');
var router = require('./routes');

var app = express();

app.engine('html', require('ejs').renderFile);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(router);
app.use(express.static(path.join(__dirname, '/')));

app.listen(3000);