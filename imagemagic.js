/**
 * Created by tom.chang on 2014/11/26.
 */
var im = require('imagemagick');
var promise= require("promise");
var  deferred= require("deferred");
 var fs=require("fs");
var path=require("path");
/*im.resize({
    srcPath: '1.jpg',
    dstPath: '20.jpg',
    width:   100
}, function(err, stdout, stderr){
    if (err) throw err;
    console.log('resized kittens.jpg to fit within 256x256px');
});

fs.mkdir(__dirname+"/a/b/b/b")
console.log(process.env.os)*/
/*
fs.rename(__dirname+"/20.jpg",__dirname+"/a/20.jpg");*/
 var resize=promise.denodeify(im.resize)
var uuid=require("uuid");
/*console.log(uuid.v1())
resize({

    srcPath: 'a.jpg',
    dstPath: 'a.jpg',
    width:   100 ,
    quality:1
}).then(function(){
    console.log("in1")
});
resize({

    srcPath: 'a.jpg',
    dstPath: 'a1.jpg',
    width:   300
}).then(function(){
    console.log("in2")
});*/
/*
im.resize({
    srcPath: '1.jpg',
    dstPath: '220.jpg',
    width:   300
}, function(err, stdout, stderr){
    if (err) throw err;
    console.log('resized kittens.jpg to fit within 256x256px');
});
*/

var defer=deferred();
setTimeout(function(){
    defer.resolve();
},100);
/*
defer.promise.done(function(){
     console.log("in")
})
*/
 var dirPath=__dirname+"/jiabao";
/*image&&file traverse*/
fs.stat(dirPath,function (err,status) {
    if(status.isDirectory()){
        fs.readdir(dirPath,function(err,files){
            (function next(i){
                if(i<files.length){
                    console.log(files.length);
                    console.log(i);
                    var oldName = path.join(dirPath,files[i]);
/*
                    var newName = path.join(dirPath,"xu"+i+".jpg");
*/
                    resize({

                        srcPath: oldName,
                        dstPath: oldName/*oldName.split(".jpg")[0]+"_thumb.jpg"*/,
                        width:   1000 ,
                        quality:1
                    }).then(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            next(++i);
                        }
                    });
                   /* fs.rename(oldName,newName,function(err){
                        if(err){
                            console.log(err);
                        }else{
                            next(++i);
                        }
                    });*/
                }else{
                    alert("ok");
                }
            }(0));

        });
    }
})



