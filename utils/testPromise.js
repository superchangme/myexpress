/**
 * Created by Administrator on 11/4/2014.
 */
var Promise=require("promise");
var gm=require("gm");
var path=__dirname+"/test.jpg";
var fs=require("fs");
data=fs.readFileSync(path,"binary");
console.log(__dirname)
gm('test.jpg')
    .options({imageMagick: true})
    .resize(240, 240)
    .noProfile()
    .write('test_r.png', function (err) {
        console.log(err)
        if (!err) console.log('done');
    });
/*var p=new Promise(function(resolve,reject){
    im.resize({
        srcPath:data,
        dstPath:"1.jpg",
        width:250
    },function(err){
        if(err)console.log("修改图片尺寸失败,---",err);
        resolve();
    })
}).then(function(a,b,c){
        console.log(a,b,c)
    });*/

/*
Promise.denodeify(function(){console.log(1)}).then(function(){console.log(2)})
*/
