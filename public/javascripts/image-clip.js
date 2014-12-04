/**
 * Created by Administrator on 11/4/2014.
 */
function imageClip(img,owidth,oheight,nwidth,nheight){
    //console.log(+new Date,"clip start")
    var canvas=document.body.appendChild(document.createElement("canvas")),ctx,data;
    if(canvas.getContext && !!img ){
        ctx=canvas.getContext("2d");
    }else{
        return img;
    }
    var ratio= 1,start= 0,imgType=img.type!=undefined?img.type:"";

    canvas.style.display="none";
    canvas.width=nwidth||1024;
    canvas.height=nheight||1024;

    if(owidth/oheight>canvas.width/canvas.height){
        ratio=oheight/canvas.height;
        start=Math.abs((owidth-canvas.width*ratio)/2);
        ctx.drawImage(img,start,
            0,owidth-2*start,oheight,0,0,canvas.width,canvas.height);
    }else if(owidth/oheight<canvas.width/canvas.height){
        ratio=owidth/canvas.width;
        start=Math.abs((oheight-canvas.height*ratio)/2);
        ctx.drawImage(img,
            0,start,owidth,oheight-2*start,0,0,canvas.width,canvas.height);
    }else{
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
    }
    data=canvas.toDataURL(imgType);
    document.body.removeChild(canvas);
    //console.log(+new Date,"clip end")
    return data;
}