
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var fs = require('fs');



var app = express();



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

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/client', user.client);
app.get('/phoneUser', user.phoneUser);
app.get('/paint', user.paint);

app.engine('html', require('ejs').renderFile);

var server=http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


//创建webscoket监听服务器
var sio = io.listen(server);

function handler(req, res) {
    fs.readFile(__dirname+'/client.html',
        function(err, data){
            req.setEncoding(encoding="utf8");
            res.writeHead(200);
            res.end(data);
        });
}


//'connection' 是socket.io 保留的，
sio.sockets.on('connection',function(socket){

    //'msg'是我们自定义的，客户端听取的时候要指定同样的事件名
    socket.emit('msg',{hi:'Happy new year.'});
    //'msg'需要和客户端发送时定义的事件名相同
    socket.on('msg',function(data){
        console.log('Get a msg from client ...');
        console.log(data);
        socket.broadcast.emit('user message',data);
    });
    //paint
    socket.on('paint msg',function(data){
        console.log('Get a msg from client ...');
        console.log(data);
        socket.broadcast.emit('paint act',data);
    });
});


sio.configure(function (){
    sio.set('authorization', function (handshakeData, callback) {
        console.log("in",handshakeData,callback)
        // 通过客户端的cookie字符串来获取其session数据
        var connect_sid = handshakeData.headers.cookie['connect.sid'];
        if (connect_sid) {
            storeMemory.get(connect_sid, function(error, session){
                if (error) {
                    // if we cannot grab a session, turn down the connection
                    callback(error.message, false);
                }
                else {
                    // save the session data and accept the connection
                    handshakeData.session = session;
                    callback(null, true);
                }
            });
        }
        else {
            callback('nosession');
        }
    });

});