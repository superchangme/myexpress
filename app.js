
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var chat = require('./routes/chat');
var games = require('./routes/games');
var upload = require('./routes/upload');
var http = require('http');
var https = require('https');
var path = require('path');
var io = require('socket.io');
var fs = require('fs');
var socketUser = {};
/*
var User = require('./dao/userModel');
*/

var app = express();
var chatRooms=[];
/*var usersWs={}*//*, //私人聊天用的websocket
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
app.use(express.bodyParser({
   /* uploadDir:__dirname+'/public/temp'*/
    uploadDir:__dirname+'/temp'
}));
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
    req.locals=app.locals;
    req.locals.user=req.session.user;
   // res.locals.user = req.session.user;
   // console.log("in main",req.locals,req.user,req.session.user)
    next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', routes.index);
app.all(/\/(?!^(login|doLogin|reg|chat.*|games\/*)$)^[\S]+$/,authentication);
app.all('/login', notAuthentication);
app.post('/doLogin',user.doLogin);
app.get('/users', user.list);
app.get('/client', user.client);
app.get('/phoneUser', user.phoneUser);
app.get("/reg",user.reg);
app.post('/reg',user.addOrUpdate);
app.get("/userProfile",user.userProfile);
app.get("/showUserImg",user.showUserImg);
app.get('/logout', authentication);
app.get('/logout',user.logout);
app.post('/uploadFile',upload.uploadFile);
app.post('/testUpload',user.testUpload);
app.engine('html', require('ejs').renderFile);
 //首页逻辑
app.get('/login',function(req,res){
    //console.log("log in-----",req.session.user);

    if( req.session.user ){
        //需要判断下是否已经登录
        res.redirect('paint');
    }else{
        res.render("login",{message:""});
    }
});

/*app.get('/paint',authentication);*/
app.get('/paint',function(req,res){
    res.render("paint",{tips:"",user:req.locals.user});
});


app.all("/chat/:id",chat.main);
app.get("/chat_room",function(req,res){
    console.log(req.locals.user)
    res.render('chat_room', { rooms: chatRooms,user:req.locals.user });
});
app.post("/chat_room",function(req,res){
    /*res.render('chat_room', { rooms: chatRooms });*/
    res.redirect('/paint');
});

app.get("/games/shudu",games.shudu);

var server=http.createServer(app/*options,app*/).listen(app.get('port'), function(){

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

sio.set('authorization', function (handshakeData, callback) {
    // 通过客户端的cookie字符串来获取其session数据
    var connect_sid = handshakeData.headers.cookie
        &&handshakeData.headers.cookie.split("=")[1];
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

//'connection' 是socket.io 保留的，
sio.sockets.on('connection',function(socket){/*
    var data.name=socket.handshake.headers.cookie
        &&socket.handshake.headers.cookie.split("=")[2];*/
    socket.on("create room",function(data){
        var id=0;
        for (var i in chatRooms) {
            if (chatRooms[i] == data.room) {
                socket.emit("create room fail","已经存在该房间名，请换一个名字试试");
                return;
            }
            id++;
        }
        socket.emit("create room success",{room:data.room,nickname:data.nickname,roomId:id});
        socket.join("chatRoom_"+id,function(){
            console.log(data.nickname+"create room chatRoom_"+id);
            console.log(socket.rooms)
            var room={};
            room.room=data.room;
            room.usersWs={};
            room.usersWs[data.nickname]={nickname:data.nickname};
            room.id=id;
            room.creator=data.nickname;
            chatRooms.push(room);
        });
    });
    //刚进入房间 还未确定是否在房间
    socket.on("in room",function(data){
        var msg={},noRoom=false;
        if(chatRooms[data.roomId]==null) {
            msg.noRoom = true;
        }else if(chatRooms[data.roomId].usersWs[data.name]!=null){
            msg.success=true;
            msg.nickname=chatRooms[data.roomId].usersWs[data.name].nickname;
            msg.room=chatRooms[data.roomId].room;
        }else{
            msg.msg="这货是谁";
        }

        console.log('in room ready',msg,data.name,chatRooms[data.roomId])
        socket.emit('in room ready',msg);
    });
    //请求加入房间
    socket.on('join room', function (data) {
        for (var roomId in chatRooms){
            if(roomId==data.roomId){
                var isMe=false,isExsit=false;
                for(var i in chatRooms[roomId].usersWs){
                    /*if(socket.id===usersWs[i].id)
                        usersWs[i].nickname=data.name;
                        socket.emit('ready',{nickname:data.name});
                    }*/
                    if(chatRooms[roomId].usersWs[data.name]!=null){
                        //if(){

                        //}
                        isMe=data.name;
                        break;
                    }
                }
                if(!isMe){
                    chatRooms[roomId].usersWs[data.name]={nickname:data.name};
                }
                chatRooms[roomId].usersWs[data.name].socketId=socket.id;
                socket.join("chatRoom_"+roomId,function(){
                    refresh_online(roomId);
                    socket.emit('join room ready',{nickname:data.name,room:chatRooms[roomId].room});
                    console.log("new user "+data.name,"join to chatRoom_"+roomId,socket.rooms)
                });
                return;
            }
        }
        socket.emit('join room ready',{failed:true,msg:"聊天室不存在"});
        console.log("no chat room go to roomlist")
    });
    socket.on('subscribe', function(data) {
        socket.join(data.room);
    });

    socket.on('unsubscribe', function(data) {
        socket.leave(data.room);
    });
   /* var session = socket.handshake.session;//session

    var name = session.name;
        usersWs[name] = socket;*/

    var refresh_online = function(roomId){
        var users=[],n = chatRooms[roomId].usersWs;
        //console.log(chatRooms[roomId])
        for (var i in n){
            var user={};
            user.name=n[i].nickname;
            if(user.name==chatRooms[roomId].creator){
                user.creator=true;
            }
            users.push(user);
        }
        console.log("refresh_online",chatRooms[roomId],roomId)
        sio.sockets.in("chatRoom_"+roomId).emit('online list', users);//所有人广播
    }

    //refresh_online();

    //'msg'是我们自定义的，客户端听取的时候要指定同样的事件名
    socket.emit('msg',{hi:'Happy new year.'});
    //'msg'需要和客户端发送时定义的事件名相同
    socket.on('chat send',function(data){
        data.from=chatRooms[data.roomId].usersWs[data.from].nickname;
        if(data.to!=null&&data.to.length>0){
            for(var i= 0,len=data.to.length;i<len;i++){
                if(chatRooms[data.roomId].usersWs[data.to[i]]!=null){
                    var toUser=chatRooms[data.roomId].usersWs[data.to[i]].socketId;
                    data.private=true;
                    console.log("socket",toUser)
                    socket.broadcast.to(toUser).emit('chat receive',data);
                    console.log('Get a chat msg from client ...',data,"send to",data.to);
                }
            }
        }else{
            console.log('Get a chat msg from client ...',data,"send to","chatRoom_"+data.roomId);
            if(data.type.indexOf("file")>-1){
                socket.broadcast.to("chatRoom_"+data.roomId).emit('chat receive',data);
            }else{
                sio.sockets.in("chatRoom_"+data.roomId).emit('chat receive',data);
            }
        }
    });
    //paint
    socket.on('paint msg',function(data){
        //console.log('Get a msg from client ...');
        //console.log(data);
        socket.broadcast.emit('paint act',data);
    });

    //公共信息
    socket.on('public message',function(msg, fn){
        socket.broadcast.emit('public receive message', msg);
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

/*
app.configure(function (){
*/

/*
});
*/



function notAuthentication(req, res, next) {
    //console.log("user---",req)
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
