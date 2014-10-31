/**
 * Created by tom.chang on 2014/4/29.
 */

var mongodb=require("./mongodb");
var Schema=mongodb.mongoose.Schema;
var userSchema=new Schema({
      username : String,
      password : String,
      age : String,
      headerImg : Buffer,
      headerImgType: String,
      headerImgPath:String,
      hobby : String,
      post_date:{type:Date,default:new Date},
      isValidate:{type:Boolean,default:true}
},{ collection: 'user' });

var User=mongodb.mongoose.model("User",userSchema);
var UserDAO=function(){}
UserDAO.prototype.save=function(obj,callback){
    var instance = new User(obj);
    instance.save(function(err){
        callback(err);
    })
}

UserDAO.prototype.find=function(obj,callback){
    User.find(obj,function(err,docs){
        callback(err,docs);
    })
}

UserDAO.prototype.findOne=function(obj,callback){
    User.findOne(obj,function(err,doc){
        callback(err,doc);
    })
}


module.exports=new UserDAO;