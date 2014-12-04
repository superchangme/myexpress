/**
 * FileName:fileUtils.js
 *
 * Author:wangyan
 * Date:2013-10-26 21:38
 * Version:V1.0.0.0
 * Email:yywang1991@gmail.com
 * Describe:
 *        文件工具类
 * Change Record:
 * {        date    name    describe}
 *
 */
var promise = require('promise');
var _webPath=require('../config').G.FIlEWEBPATH;

function mkDir(path) {
    var path = getFileDir(path);
    var ndir = require('ndir');
    var mkdir = promise.denodeify(ndir.mkdir);
    return  mkdir(path).then(function (err) {
        if (err) {
            throw err;
        }
        return path;
    });

}

function getFileDir(path) {
    var basePath = require('../config').G.FILEPATH;/*
     var day = new Date();
     var dayStr = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();*/
    return basePath+"/"+path /*+ day.getTime() + '/'*/;
}
exports.mkDir = mkDir;
exports.rePath=function(file,filePath){
    var day = new Date;
    var dateStr = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
    var name = day.getTime()+"."+file.name.replace(/(.*)\.(.*)/g,"$2");
    this.realPath=filePath+"/"+name;
    this.webPath = _webPath + dateStr + '/'+ name;
}