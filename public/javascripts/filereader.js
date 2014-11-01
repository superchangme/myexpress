/**
 * Created by Administrator on 2014/10/28.
 */


function readrSpt(){
    //判断浏览器是否支持FileReader接口
    if(typeof FileReader == 'undefined'){
        result.InnerHTML="<p>你的浏览器不支持FileReader接口！</p>";
        //使选择控件不可操作
        file.setAttribute("disabled","disabled");
        return;
    }
}


function readAsDataURL(file,result,callback){
    readrSpt();
    //检验是否为图像文件
    var file = file.files[0],_limit=500,ratio=1;
    /*if(file.size/1024>500){
     ratio=Math.floor(500*1024*100/file.size);
     }*/
    if(!/image\/\w+/.test(file.type)){
        alert("看清楚，这个需要图片！");
        return false;
    }
    var reader = new FileReader();
    //将文件以Data URL形式读入页面
    reader.readAsDataURL(file);
    reader.onload=function(e){
        if(result){
            //显示文件
            result.innerHTML='<img src="' + this.result +'" alt="" />';
        }
        callback(this.result);
    }
}

function readAsBinaryString(file,callback){
    readrSpt();

    var part= 0,fileName=file.name,
        step=1024*8096,start= 0, a=0,b= 0,total=file.size,loaded= 0,fileType=file.type;

    //$("#fileLink").attr("href",URL.createObjectURL(blob));
    //将文件以arraybuffer形式读入
    (function(start){
        var blob=file.slice(start,start+step+1),reader = new FileReader(),self=arguments.callee;
        // console.log(blob)
        reader.readAsArrayBuffer(blob);
        reader.onprogress=function(e){
            loaded+=e.loaded;
            var per=loaded/total;
            if(loaded==total){
                per=100;
                callback(this.result,part,per,fileName,fileType,true);
            }else{
                per*=100;
                callback(this.result,part,per);
                part++;
            }
        }
        reader.onload=function(e){
 //           console.log(loaded)
            //console.log(this.result)
            if(loaded<total){
                self(loaded);
                //  callback(this.result);
            }else{
                loaded=total;
            }
        }
    })(start);
}

function readAsText(){
    readrSpt();
    var file = document.getElementById("file").files[0];
    var reader = new FileReader();
    //将文件以文本形式读入页面
    reader.readAsText(file);
    reader.onload=function(f){
        var result=document.getElementById("result");
        //显示文件
        result.innerHTML=this.result;
    }
}

