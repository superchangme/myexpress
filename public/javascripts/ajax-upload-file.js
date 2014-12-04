(function($){
    var ajaxUpload=function(options){
        this.dragBox=options.dragBox;
        this.container=document.getElementById(this.dragBox);
        this.oneFile=options.oneFile||false;
        this.fileList=document.getElementById(options.fileList);
        this.postUrl=options.postUrl;
        this.fileName=options.fileName;
        this.fileCount=0;
        this.imageClip=options.imageClip||false;
        this.callback=options.callback;
    };
    ajaxUpload.prototype.init=function(){
        window.onload=this.addListener();
    }
    ajaxUpload.prototype.addListener=function(){
        var container = document.getElementById(this.dragBox),that=this;
        container.addEventListener("dragenter", function(event){
            //that.fileList.innerHTML ='';
            event.stopPropagation();
            event.preventDefault();
        }, false);
        container.addEventListener("dragover", function(event){
            event.stopPropagation();
            event.preventDefault();
        }, false);
        container.addEventListener("drop", $.proxy(this.handleDrop,this), false);
    };

    ajaxUpload.prototype.handleDrop=function(event){
        var files = event.dataTransfer.files,self=this,
            len=this.oneFile ? 1 : files.length;
        event.stopPropagation();
        event.preventDefault();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if(self.oneFile&&self.fileList.getElementsByClassName("fileItem").length){
                self.fileList.removeChild(self.fileList.getElementsByClassName("fileItem")[0])
            }
            var li = document.createElement('li');
            var progressbar = self.container.getElementsByTagName("progress")[0];
            var img = document.createElement('img');
            var name = document.createElement('span');

            progressbar.className = "progressBar";
            var imageReg=/image.*/,isImage=files[i].type.match(imageReg),tempImage,input;
            if(isImage){
                tempImage=new Image();
                tempImage.src=(files[i].getAsDataURL && files[i].getAsDataURL()) ||
                (window.URL.createObjectURL && window.URL.createObjectURL(files[i])) ||
                (window.webkitURL.createObjectURL && window.webkitURL.createObjectURL(files[i]));
                tempImage.onload=function(){
                    start=+new Date;
                    img.src=imageClip(tempImage,tempImage.naturalWidth,tempImage.naturalHeight,250,250);
                }
                /* img.src = (files[i].getAsDataURL && files[i].getAsDataURL()) ||
                     (window.URL.createObjectURL && window.URL.createObjectURL(files[i])) ||
                     (window.webkitURL.createObjectURL && window.webkitURL.createObjectURL(files[i]));
            */ }
            if(this.imageClip&&isImage){
                img.onload=function(){
                    img.width = 250;
                    img.height = 250;
                    if(self.postUrl){
                        self.uploadFile(JSON.stringify({imgData:img.src,name:file.name}), progressbar);
                    }else{
                        input=document.createElement("input");
                        input.style.display="none";
                        input.name=self.fileName;
                        input.value=img.src;
                        self.fileList.appendChild(input);
                    }
                }
            }else{
                this.uploadFile(file, progressbar)
            }
            li.appendChild(img);
            li.appendChild(name);
            li.className="fileItem";
            this.fileList.appendChild(li);
        }
    };

    ajaxUpload.prototype.uploadFile=function(file, progressbar) {
        if(!this.postUrl){
            return;
        }
        var xhr = new XMLHttpRequest();
        var	upload = xhr.upload;
        var p = document.createElement('p');
        var self=this;
        p.textContent = "0%";
        progressbar.appendChild(p);
        upload.progressbar = progressbar;
        upload.addEventListener("progress", uploadProgress, false);
        upload.addEventListener("load", uploadSucceed, false);
        upload.addEventListener("error", uploadError, false);
        xhr.open("POST", this.postUrl+"?fileName="+file.name);
        xhr.overrideMimeType("application/octet-stream");
        xhr.onreadystatechange=function(){
            if (xhr.readyState==4 && xhr.status==200)
            {
                console.log("file---"+file.name+"----上传成功；",xhr.responseText);
                var data=(function(){ var data={};
                    try{
                        data=JSON.parse(xhr.responseText)
                    }finally{
                        return data;
                    }
                })(),filePath;
                if(data.filePath){
                    if(typeof data.filePath.push ==="function"){
                        filePath=data.filePath[0];
                    }else{
                        filePath=data.filePath;
                    }
                    var input=self.fileList.getElementsByName(self.fileName+"[0]");
                    if(self.oneFile&&input.length){
                        input.value=filePath;
                    }else{
                        input = document.createElement('input');
                        input.name=self.fileName+"["+self.fileCount+"]";
                        input.type="hidden";
                        input.value=filePath;
                        self.fileList.appendChild(input);
                    }

                }
                self.callback(data);
                self.fileCount++;
            }
        }
        if (window.FormData) {
            //Chrome12+
            var formData = new FormData();
            formData.append("file",file);
            xhr.send (formData);
        }else if(xhr.sendAsBinary){
            xhr.sendAsBinary(file.getAsBinary());
        }

    }
    function uploadProgress(event){
        if (event.lengthComputable) {
            var percentage = Math.round((event.loaded * 100) / event.total);
            console.log("percentage:" + percentage);
            if (percentage < 100) {
              /*  event.target.progressbar.firstChild.style.width = (percentage*2)+"px";
                event.target.progressbar.firstChild.textContent = percentage + "%";
           */
                event.target.progressbar.value="percentage"
            }
        }
    }
    function uploadSucceed(event) {
        event.target.progressbar.value="100";
        /*event.target.progressbar.firstChild.style.width = "200px";
        event.target.progressbar.firstChild.textContent = "100%";*/
    }
    function uploadError(error) {
        alert("error: " + error);
    }

    $.ajaxUpload=function (option) {
        return new ajaxUpload(option).init();
    }
})(jQuery);

