/**
 * Created by tom.chang on 2014/4/30.
 */
var fs = require('fs');
var utils = require('../utils/fileUtils');
var promise = require('promise');
var _webPath=require('../config').G.FIlEWEBPATH;
function uploader(req, res,filePathArr) {
/*
    console.log("uploader in-----",req.files);
*/
    var day = new Date;
    var dateStr = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
    var createPath = dateStr ;
    if (req.files != 'undifined') {
        utils.mkDir(createPath).then(function (path) {
            uploadFile(req, res, path, 0,filePathArr);
        });
    }
}
function type(o){
    return  Object.prototype.toString.call(o).slice(8,-1);
}
function uploadFile(req, res, filePath, index,filePathArr) {
   var files= type(req.files.file)==="Object"?[req.files.file]:req.files.file;
    var tempPath = files[index].path;
    /*var name = files[index].name;*/
    var day = new Date;
    var dateStr = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
    var name = day.getTime()+"."+files[index].name.replace(/(.*)\.(.*)/g,"$2");
    var realPath=filePath+"/"+name;
    var webPath = _webPath + dateStr + '/'+ name;
    console.log(filePath,realPath)
/*
    console.log(files[index])
*/
    if (tempPath) {
        var rename = promise.denodeify(fs.rename);
        rename(tempPath, realPath).then(function () {
            console.log(realPath)
            var unlink = promise.denodeify(fs.unlink);
            unlink(tempPath);
            filePathArr.push(realPath);
        }).then(function () {
            console.log(index,files.length);
            if (index == files.length - 1) {
                res.send(200,{mess:"上传成功",filePath:webPath});
            } else {
                uploadFile(req, res, path, index + 1);
            }
        });
    }
}

exports.uploadFile=function(req,res){
    var filePathArr=[];
    uploader(req,res,filePathArr);
}