/**
 * Created by tom.chang on 2014/4/3.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userdb = require("../config").userdb;//数据库地址

exports.connect = function(callback) {
    mongoose.connect('mongodb://localhost/nodetest',callback);
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}

exports.setup = function(callback) { callback(null); }

//定义user对象模型
var UserScheme = new Schema({
    name:String
    ,password :String
    ,age:{type:Number,min:11,max:100}
    ,post_date:{type:Date,default:new Date}
    ,isValidate:{type:Boolean,default:true}

});



//访问user对象模型
mongoose.model('nodeuser', UserScheme,"user");

var User = mongoose.model('nodeuser');



exports.save=function(o,callback){
    var newUser = new User(o);
    newUser.save(function(err){
        if(err){
            util.log("FATAL"+err);
            callback(err);
        }else{
            callback(null);
        }
    });
}

exports.find=function(o,callback){
    User.find(o, function(err,docs){
        if(err){
            util.log("FATAL"+err);
            callback(err);
        }else{
            callback(null,docs);
        }
    });
}

exports.findOne=function(o,callback){
    console.log(o);
    User.findOne(o, function(err,doc){
        console.log(err,doc)
        if(err){
            util.log("FATAL"+err);
            callback(err);
        }else{
            callback(null,doc);
        }
    });
}