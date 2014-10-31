
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
var formidable= require("formidable");
var util=require("util");
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

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', routes.index);

app.get("/reg",user.reg);
app.post('/reg',user.addOrUpdate);
/*
 app.all("/[^(login)]",authentication);
 */
/*app.all('/login', notAuthentication);
 app.get('/users', user.list);
 app.get('/client', user.client);
 app.post("*//*",parseForm);
 app.get('/phoneUser', user.phoneUser);
 app.get("/reg",user.reg);
 app.post('/reg',user.addOrUpdate);
 app.get('/logout', authentication);
 app.get('/logout',user.logout);*/
app.engine('html', require('ejs').renderFile);
//首页逻辑
app.get('/login',function(req,res){
    console.log("log in-----",req.session.user);
    console.log("req in-----");


    if( req.session.user ){
        //需要判断下是否已经登录
        res.redirect('paint');
    }else{
        res.render("login",{message:""});
    }
});

app.get('/paint',authentication);
app.get('/paint',function(req,res){
    res.render("paint",{tips:"",user:req.session.user});
});

app.post('/doLogin',function(req,res){

    var loginUser=req.body.user;

    console.log("post paint in-----",req.session)
    /* if(user.name){
     //res.end('nickname cannot null');
     res.render('login',{tips:'nickname cannot null'});
     }else if(usersWs[name]){
     res.render('login',{tips:'nickname is existed'});
     }else{
     req.session.name = name;//设置session
     res.render('paint',{name:name});
     }*/
    if(req.session.user){
        res.render('paint',{name:loginUser.name});
    }else{
        User.findOne(loginUser,function(err,doc){
            if(doc){
                //set into user session
                //usersWs[doc.name]=doc;
                req.session.user=doc;
                res.render('paint',{user:doc});
            }else{
                res.render('login',{message:'username or password is wrong'});
            }
        })


    }

});


/*
 app.post('/reg',function(req,res){

 console.log("post reg in-----")
 var newUser=req.body.user;
 */
/*User.reg(newUser);*//*

 User.find(newUser,function(err,items){
 console.log("find newUse----",items);
 if(items.length){
 res.render('reg',{message:"已经被注册了"});
 }else{
 User.save(newUser,function(err){
 console.log("save new user---"+err)
 if(err){
 callback(err);
 }else{
 res.render('login',{message:"请登录"});
 }
 });
 }
 })

 });
 */



/*// create user db
 User.connect(function(error){
 if (error) throw error;
 });*/

//connect server
var server=https.createServer(options,app).listen(app.get('port'), function(){

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
    console.log("socket in",socket.handshake.session)
    /* var session = socket.handshake.session;//session

     var name = session.name;
     usersWs[name] = socket;*/

    var refresh_online = function(){
        var n = [];
        for (var i in usersWs){
            n.push(i);
        }
        sio.sockets.emit('online list', n);//所有人广播
    }

    refresh_online();

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

    //公共信息
    socket.on('public message',function(msg, fn){
        socket.broadcast.emit('public message', name, msg);
        fn(true);
    });

    //私人@信息
    socket.on('private message',function(to, msg, fn){
        var target = usersWS[to];
        if (target) {
            fn(true);
            target.emit('private message', name+'[私信]', msg);
        }
        else {
            fn(false)
            socket.emit('message error', to, msg);
        }
    });
});

sio.configure(function (){
    sio.set('authorization', function (handshakeData, callback) {
        // 通过客户端的cookie字符串来获取其session数据
        var connect_sid = handshakeData.headers.cookie.split("=")[1];
        // console.log("connect_sid----",handshakeData.headers.cookie);
        //console.log("store----",store)
        if (connect_sid) {
            store.get(connect_sid, function(error, session){
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



function notAuthentication(req, res, next) {
    console.log("user---",req.session.user)
    if (req.session.user) {
        req.session.error='已登陆';
        console.log("you are logged")
        return res.redirect('/paint');
    }
    next();
}

function authentication(req, res, next) {
    if (!req.session.user) {
        req.session.error='请先登陆';
        return res.redirect('/login');
    }
    next();
}

function parseForm(req,res,next){
    var form = new formidable.IncomingForm,
        fields = [];
    form.parse(req,function(err,fileds,files){
        console.log("in form-----")   ;
        console.log('-> upload done');
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received fields:\n\n '+util.inspect(fields));
        res.write('\n\n');
        res.end('received files:\n\n '+util.inspect(files));
    })
}/**
 * Created by tom.chang on 2014/4/29.
 */
