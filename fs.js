var fs=require("fs");
console.log(__dirname)
//fs.writeFile(__dirname+"/1",new Buffer("1253","UTF-8"));
fs.readFile(__dirname+'/1.png', function (err, data) {
    if (err) throw err;
    console.log(data.toString());
    fs.appendFile('1.png', data, function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file!'); //数据被添加到文件的尾部
    });
});


fs.open(__dirname+'/1', 'r+', function(err, fd) {
    if (err) {
        console.error(err);
        return;
    }
    console.log(fd)
    var buf = new Buffer("34");

    fs.write(fd, buf, 0,2 ,0, function (err, bytesRead, buffer) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('bytesRead: ' + bytesRead);
        console.log(buffer.toString());
    })
})
