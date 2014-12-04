/**
 * Created by tom.chang on 2014/4/30.
 */
var fs = require('fs');
var utils = require('../utils/fileUtils');
var Promise = require('promise');
var im =require("imagemagick");
function createFilePath() {
    /*
     console.log("uploader in-----",req.files);
     */
    var day = new Date;
    var dateStr = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
    var createPath = dateStr ;
    return utils.mkDir(createPath);
}
function type(o){
    return  Object.prototype.toString.call(o).slice(8,-1);
}

function reSizeImage(srcPath,dstPath,width){
    return new Promise(
        function(resolve,reject){
            console.log(srcPath,dstPath,width)
        im.resize({
        srcPath:srcPath,
        dstPath:dstPath,
        width:width||250
        },function(err){
            if(err)console.log("修改图片尺寸失败,---"+err);
                resolve();
            }
        )
    });
}
function base64ToFile(file,filePath,req,res,isLocal){
    var base64Data = file.imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var imageType=/(?:^data:image\/(.*);base64)/.exec(file.imgData);
    file.name=imageType&&imageType[1];//data:image/png
    var rePath = new utils.rePath(file,filePath);
    if(isLocal){
        fs.writeFileSync(rePath.realPath, dataBuffer);
        return rePath.webPath;
    }else{
        fs.writeFile(rePath.realPath, dataBuffer, function(err) {
            if(err){
                res.send(err);
            }else{
                res.send(200,{mess:"上传成功",filePath:rePath.webPath});
            }
        });
    }
}

function uploadFile(req, res, filePath, index) {
    var files= type(req.files.file)==="Object"?[req.files.file]:req.files.file;
    var tempPath = files[index].path;
    var rePath = new utils.rePath(files[index],filePath);
    var imageReg=/image.*/;
    if (tempPath) {
       /* if(files[index].type.match(imageReg)){
            console.log("In upload image")
            promise=reSizeImage(tempPath,rePath.realPath);
        }else{*/
            console.log("In upload file")

            rename= promise.denodeify(fs.rename);
            rename(tempPath, rePath.realPath).then(function () {
            //   console.log(realPath)
            var unlink = promise.denodeify(fs.unlink);
            unlink(tempPath).then(function(){
                console.log("删除临时文件"+tempPath);
            });
            _circleUpload();
        });
    }
    function _circleUpload(){
        if (index == files.length - 1) {
            res.send(200,{mess:"上传成功",filePath:rePath.webPath});
        } else {
            uploadFile(req, res, path, index + 1);
        }
    }
}

exports.uploadFile=function(req,res){
    createFilePath().then(function(path){
        uploadFile(req, res, path, 0);
    })
};

exports.upLoadImage=function(req,res,image,isLocal){
    return new Promise(function(resolve,reject){
        createFilePath().then(function(path){
            try{
                var imageObj = typeof  image ==="object" ? image: JSON.parse(image),
                    webPath=base64ToFile(imageObj, path,req,res,isLocal);
                resolve(webPath);
            } catch(e) {
                reject();
                res.send("error image data");
            }
        })
    });
}