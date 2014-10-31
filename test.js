var mongoose = require('mongoose')

    , Schema = mongoose.Schema


var assert =require('assert');
mongoose.connect('mongodb://localhost/console');



var UserScheme = new Schema({
    username:String,
    passowrd:String
});



//访问user对象模型
mongoose.model('gogogo',UserScheme,'console');

var TAOBAO = mongoose.model('gogogo');
TAOBAO.create({id:1, name: 'jelly bean' }, { name: 'snickers' }, function (err, jellybean, snickers) {


    console.log(jellybean)



});
//var TAOBAO  = mongoose.model("dele");

var taobao  = new TAOBAO();


/*taobao.find({},function(err,doc){

    console.log(doc);
})*/
taobao.user_id  = 1;

taobao.username = 'henteng3000';

taobao.password = '123';

taobao.save(function(err) {

    if (err) {

        console.log('save failed');

    }

    console.log('save success');

})/*
var painSchema=new Schema({name:String});
mongoose.model('pain',painSchema,'pain');
var Pain=mongoose.model('pain');
TAOBAO.findOne({username:'teng'},function(err,doc){
    if (err) {

        callback('findOne failed');

    }else{
        var user={name:"tom"};
        Pain.find(function(err,docs){
            var pain=docs[0]
            pain.populate(user,{
                path:'pain' ,
                model: 'pain',
                options: {}
            }, function (err, user) {
                console.log(user) // the document itself is passed
            })
        })

    }


})

*/