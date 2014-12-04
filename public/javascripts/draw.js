/**
 * Created by Administrator on 11/8/2014.
 */
var Draw=(function(){
    var isTouch=typeof window.ontouchstart!=="undefined"&&window.navigator.userAgent.toLowerCase().indexOf("mobile")>-1,
        startEvent=isTouch?"touchstart":"mousedown",
        moveEvent=isTouch?"touchmove":"mousemove",
        endEvent=isTouch?"touchend":"mouseup";
    if(isTouch){
        jQuery.each(["touchstart","touchmove","touchend"],
            function(i, name) {jQuery.fn[name] = function(fn) {return fn ? this.bind(name, fn) : this.trigger(name);};});
       /* $(document).on("touchmove",function(e){
            e.preventDefault();
        })*/
    }
    var draw =function(opts){
        this.isPainter=opts.isPainter;
        this.canvas=opts.canvas;
        this.offset=$(this.canvas).offset();
        this.socket=opts.socket;
        this.ctx=this.canvas.getContext("2d");
        this.ctx.strokeStyle=opts.strokeStyle||"black";
        this.ctx.lineWidth=opts.lineWidth||5;
        this.ctx.lineCap=this.ctx.lineJoin=opts.lineStyle?opts.lineStyle:"";
        this.isMenuOn=false;
        this.isMove=false;
        this.eraser=opts.eraser;
        this.erasing=false;
        this.memory=new DbLinkList(10);
        this.t1={};
        this.t2={};
        this.init();
    }
    draw.prototype.begin=function(){
        var me=this,data=new Image;
        data.src="";
        this.memory.add(data);
        if(me.isPainter){
            $(this.canvas).bind(startEvent,$.proxy( me, "record" )) ;
            $(this.canvas).bind(moveEvent,$.proxy( me, "paint" )) ;
            $(this.canvas).bind(endEvent,$.proxy( me, "close" )) ;
        }
        this.socket&&this.socket.on('paint act', function(msg) {
            if(me.isPainter) {
                return;
            }
            var e=msg;
            switch(msg.func){
                case "paint":
                    me.paint(e);
                    break;
                case "record":
                    me.record(e);
                    break;
                case "close":
                    me.close(e);
                    break;
                case "drop":
                    me.drop(e);
                    break;
                case "wipe":
                    me.wipe(e);
                    break;
                case "updateDraw":
                    me.updateDraw(e);
                    break;
                case "changeStyle":
                    me.changeStyle(e);
                    break;
                case "clearAll":
                    me.clearAll(e);
                    break;
                case "history":
                    me.history(0,e);
                    break;

            }
        });
        $("#menuList").delegate("a","click",function(){
            $("#menuList").hide();
            if($(this).data("fc")=="cha"){
                me.ctx.strokeStyle="white";
            }else{
            }
            me.isMenuOn=false;
        });
    }


    draw.prototype.record=function(e){
        //console.log("record in",e)
        var x= e.offsetX||e.originalEvent.touches[0].clientX-this.offset.left,
            y= e.offsetY||e.originalEvent.touches[0].clientY-this.offset.top;
        if(this.isMenuOn){
        }else{
            if(e.which===1|| e.type==="touchstart"){
                this.isMove=true;
                this.ctx.beginPath();
                /*
                this.ctx.save();
                this.ctx.arc(x,y,2.5,0,Math.PI*2);
                this.ctx.fill();
                this.ctx.restore();*/
                if(this.erasing){
                    $(this.eraser).css({top:y,left:x}).show();
                }
                this.t1={x:x,y:y};
                if(e.originalEvent.touches&&e.originalEvent.touches.length==2){
                    this.t2={x:e.originalEvent.touches[1].clientX-this.offset.left,
                        y:e.originalEvent.touches[1].clientY-this.offset.top }
                }
                //this.isPainter&&this.update(e,"record",{x: x,y:y});
                $(this.canvas).addClass("ondraw");
                /*this.opList=new Array;
                this.opList.push({x:x,y:y,w:this.ctx.lineWidth});*/
            }else if(e.which==3){
                var top= e.pageY-20,left= e.pageX-20;
                //console.log(top,left)
                $("#menuList").css({top:top,left:left}).show();
                this.isMenuOn=true;
            }
        }
    }
    draw.prototype.paint=function(e){
        e.preventDefault();
        e.stopPropagation();
        var x= e.offsetX||e.originalEvent.touches[0].clientX-this.offset.left,
            y= e.offsetY||e.originalEvent.touches[0].clientY-this.offset.top,
            x1=e.originalEvent.touches&&e.originalEvent.touches[1]&&e.originalEvent.touches[1].clientX-this.offset.left,
            y1=e.originalEvent.touches&&e.originalEvent.touches[1]&&e.originalEvent.touches[1].clientY-this.offset.top;
        //console.log(x,y)
        if(this.isMove){
            if(this.erasing){
                $(this.eraser).css({"top":y,left:x});
            }
            this.ctx.moveTo(this.t1.x,this.t1.y);
            this.ctx.lineTo(x, y);
            //console.log("paint in",e)
            this.ctx.stroke();
            this.t1={x:x,y:y};
            if(x1){
                this.ctx.moveTo(this.t2.x,this.t2.y);
                this.ctx.lineTo(x1, y1);
                this.ctx.stroke();
                this.t2={x:x1,y:y1};
            }
        }
        /*if(this.isPainter){
            if($(canvas).data("wipe")){
                this.update(e,"wipe",{x:x,y:y});
            }else{
               // this.update(e,"paint",{x:x,y:y});
                *//*this.opList.push({x:x,y:y});*//*
            }
        }*/
    }
    draw.prototype.close=function(e){
        //console.log("close in",e)
        this.isMove=false;
        var data=new Image();
        data.src=this.canvas.toDataURL();
        this.isPainter&&this.update({data:data.src},"updateDraw");
        this.memory.add(data);
        $(this.canvas).removeClass("ondraw");
        this.ctx.closePath();
        $(this.eraser).hide();
    }
    draw.prototype.updateDraw=function(e){
        var data=new Image();
        data.src= e.data;
        this.ctx.beginPath();
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.drawImage(data,0,0,this.canvas.width,this.canvas.height);
        this.ctx.closePath();
    }
    draw.prototype.update=function(e,act,pos){
        var mess=e;
        if(typeof(e.type)==="undefined"){
            mess.func=act;
        }else{
            mess={
                func : act,
                type: e.type,
                offsetX: pos&&pos.x,
                offsetY: pos&&pos.y,
                which: e.which
            }
        }
            this.socket&&this.socket.emit('paint msg', mess);
    }
    draw.prototype.init=function(){
        this.begin();
    }

    draw.prototype.drop=function(){
        //console.log("drop in----",this.canvas.width);
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    draw.prototype.wipe=function(e){
        this.ctx.strokeStyle="white";
        this.erasing=true;
        /*var x= e.offsetX||e.originalEvent.touches[0].clientX-this.offset.left,
            y= e.offsetY||e.originalEvent.touches[0].clientY-this.offset.top;
        if(this.isMove){
            this.ctx.clearRect(x, y,20,10);
            //console.log("wipe in",e)
        }*/
    }
    draw.prototype.changeStyle=function(e){
        this.ctx[e.style]= e.value;
        this.erasing=false;
        this.isPainter&&this.update(e,"changeStyle");
    }
    draw.prototype.clearAll=function(e){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    draw.prototype.history=function(flag,msg){
        var isMove=false,data;
        if(flag==-1){
            isMove=this.memory.backward();
        }else if(flag==1){
            isMove=this.memory.forward();
        }
        if(isMove){
            data = this.memory.getTailData();
        }else if(msg){
            data=new Image;
            data.src = msg.data;
        }
        if(data){
            if(!msg){
                this.update({data:data.src},"history");
            }
            this.ctx.beginPath();
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            this.ctx.drawImage(data,0,0,this.canvas.width,this.canvas.height);
            this.ctx.closePath();
            return true;
        }
        return false;
    }
    return draw;
})();
function DbLinkList(max){
    var first=null;//链表临时值
    this.max=max||10;//长度
    this.head=null;//头
    this.tail=null;//尾
    this.size=0;//<--prev next-->
    this.add=function(data){
        if(this.size==this.max){
            var ptemp=this.head;
            if(this.head&&this.head.next){
                this.head=this.head.next;
                this.head.prev=null;
                ptemp=null;
            }
        }
        var _prev=first;
      //  pos for c=head 0 1 c= c.next pos...c=get new {} one.prev=get.prev get.prev=one one.next=get
        first={data:data,next:null,prev:first};
        if(this.head==null){
            this.head=_prev;
        }
        this.tail=first;
        if(_prev!=null){
            _prev.next=first;
        }
        if(this.size<this.max)this.size++;
    }
    this.backward=function(){
        if(this.tail&&this.tail.prev){
            this.tail=this.tail.prev;
            return true;
        }
        return false;
    }
    this.forward=function(){
        if(this.tail&&this.tail.next){
            this.tail=this.tail.next;
            return true;
        }
        return false;
    }
    this.getTailData=function(){
        if(this.tail!=null){
          return  this.tail.data;
        }
        return null;
    }
}