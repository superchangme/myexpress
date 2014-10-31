
/*
 * GET users listing.
 */
var User = require("./../models/User");
var fs =require("fs");
var util=require("util");
exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.client = function(req, res){
    res.render('client', { title: 'Express' });
};

exports.phoneUser = function(req, res){
    res.render('phoneUser', { title: 'Express' });
};
/*
exports.paint = function(req, res){
    res.render('paint', { title: 'Express' });
};*/

exports.login = function(req, res){
    res.render('login', { title: 'Express' });
};
exports.doLogin=function(req,res){
        var loginUser=req.body.user;
        console.log("post paint in-----",req.session.user)
        if(req.session.user){
            res.redirect('paint');
        }else{
            User.findOne(loginUser,function(err,doc){
                //console.log(loginUser,"find user---",doc)
                if(doc){
                    //set into user session
                    //usersWs[doc.name]=doc;
                    req.session.user={username:doc.username};
                    res.redirect('/paint');
                }else{
                    res.render('login',{message:'username or password is wrong'});
                }
            })

        }
}

exports.reg = function(req, res){
    res.render('reg', { title: 'Express',message:"" });
};

exports.logout = function(req, res){
    req.session.user=null;
    res.redirect("/");
};

exports.addOrUpdate=function(req,res){
    var json = req.body.user;

   if(json._id){
        //update
    }else{
        //insert
       /* if(req.headerImg && req.files.headerImg.path){
            var buffer=fs.readFileSync(req.files.headerImg.path);
            json.headerImg=buffer;
            json.headerImgType=req.files.headerImg.type;
            json.headerImgPath = req.headerImg[0].path;
        }*/
       json.headerImgPath = req.body.headerImg[0];
        User.find(json,function(err,doc){
            if(err){
                 res.send({"success":false,"err":err});
             }else if(!err && doc.length>0){
                 res.send({"success":false,"err":"用户已存在"});
             }else{
                console.log("save user---",json,req.body);
                 User.save(json,function(err){
                     if(err){
                         res.send({"success":false,"err":err});
                     }else{
                         req.session.user=json;
                         res.send({"success":true});
                     }
                 })
             }
        })
    }
}

exports.userProfile=function(req,res){
    console.log("in user profile",req.session.user)
    if(req.session.user){
        User.findOne(req.session.user,function(err,doc){
            if(err){
                res.render("error",{"err":err});
            }else if(doc){
                //deal image
                console.log("get user profile ",doc)
                res.render("userProfile",{user:doc});
            }
        })
    }else{
        res.redirect("/login");
    }
}


exports.showUserImg=function(req,res){
    if(req.session.user){
        User.findOne(req.session.user,function(err,doc){
            console.log("user img----",err,doc)
            if(err){
            }else if(doc){
                //deal image

               /*
                var imgData=doc.headerImg;
                res.writeHead('200', {'Content-Type': doc.headerImgType}); */   //写http头部信息
/*
                res.write(imgData,"binary");
*/
                var path=doc.headerImgPath;
                res.send(path);
                res.end();

            }
        })
    }else{
        res.redirect("/login");
    }
}

exports.testUpload=function(req,res){
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received fields:\n\n '+util.inspect(req.fields));
    res.write('\n\n');
    res.end('received files:\n\n '+util.inspect(req.files));
}
