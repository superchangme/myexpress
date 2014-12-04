/**
 * Created by Administrator on 2014/10/22.
 */
exports.push = function (req, res) {
    var params
        , uname
        , quantity
        , text;
    params = urllib.parse(req.url, true).query;
    uname = params.uname;
/*
    quantity = params.quantity;
*/
    text = params.text;
    //接受到发送消息后，为每个链接用户加入推送消息
    for (var i in user) {
        user[i].add({
            userName: uname,
/*
            flowersQuantity: quantity,
*/
            text: text
        })
    }
    //服务端的监控，可以在命令提示符中看到
    console.log('有新消息');
};

exports.main=function(req,res){
    console.log("in-chat----",req.route,req.params,req.query)
    res.render('chat', { title: 'Express' ,roomId:req.params.id});
}

