
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var https = require('https');
var path = require('path');
var io = require('socket.io');
var fs = require('fs');

var formidable = require('formidable');
var util = require('util');
/*
 var User = require('./dao/userModel');
 */

var app = express();

var usersWs={}/*, //私人聊天用的websocket
 storeMemory = new MemoryStore({
 reapInterval: 60000 * 10
 });//session store*/
var SessionStore = require("session-mongoose")(express);
var store = new SessionStore({
    url: "mongodb://127.0.0.1/session",
    interval: 120000

});
var options = {
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./certificate.pem')
};


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('paint boy'));
app.use(express.cookieSession({secret : 'fens.me'}));
app.use(express.session({
    secret : 'fens.me',
    store: store,
    cookie: { maxAge: 900000 }
}));

/*
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
});
*/

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get("/reg",user.reg);
app.post('/reg',user.addOrUpdate);
app.use("/regPost",function(req,res) {
    console.log("in----");
    res.send(req.body)
    console.log(req.files,req.fields)
});

http.createServer(app).listen(app.get('port'), function(){

    console.log('Express server listening on port ' + app.get('port'));
});

