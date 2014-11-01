(function($){
    var ajaxUpload=function(options){
        this.dragBox=options.dragBox;
        this.fileList=document.getElementById(options.fileList);
        this.postUrl=options.postUrl;
        this.fileName=options.fileName;
        this.fileCount=0;
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
        var files = event.dataTransfer.files;
        event.stopPropagation();
        event.preventDefault();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var li = document.createElement('li');
            var progressbar = document.createElement('div');
            var img = document.createElement('img');
            var name = document.createElement('span');

            progressbar.className = "progressBar";
            var imageReg=/image.*/;
            if(files[i].type.match(imageReg)){
                img.src = (files[i].getAsDataURL && files[i].getAsDataURL()) ||
                    (window.URL.createObjectURL && window.URL.createObjectURL(files[i])) ||
                    (window.webkitURL.createObjectURL && window.webkitURL.createObjectURL(files[i]));
                img.width = 32;
                img.height = 32;
            }
            name.innerHTML = file.name;
            li.appendChild(img);
            li.appendChild(name);
            li.appendChild(progressbar);

            this.fileList.appendChild(li);
            this.uploadFile(file, progressbar)
        }
    };

    ajaxUpload.prototype.uploadFile=function(file, progressbar) {
        var xhr = new XMLHttpRequest();
        var	upload = xhr.upload;
        var p = document.createElement('p');
        var that=this;
        p.textContent = "0%";
        progressbar.appendChild(p);
        upload.progressbar = progressbar;
        upload.addEventListener("progress", uploadProgress, false);
        upload.addEventListener("load", uploadSucceed, false);
        upload.addEventListener("error", uploadError, false);
        xhr.open("POST", this.postUrl+"?fileName="+file.name);
        xhr.overrideMimeType("application/octet-stream");
        xhr.onreadystatechange=function(){
            console.log(xhr.status)
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

                    var input = document.createElement('input');
                    input.name=that.fileName+"["+that.fileCount+"]";
                    input.type="hidden";
                    input.value=filePath;
                    that.fileList.appendChild(input);
                }
                that.callback(data);
                that.fileCount++;
            }
        }
        if (window.FormData) {
            //Chrome12+
            var formData = new FormData();
            formData.append("file", file);
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
                event.target.progressbar.firstChild.style.width = (percentage*2) + "px";
                event.target.progressbar.firstChild.textContent = percentage + "%";
            }
        }
    }
    function uploadSucceed(event) {
        event.target.progressbar.firstChild.style.width = "200px";
        event.target.progressbar.firstChild.textContent = "100%";
    }
    function uploadError(error) {
        alert("error: " + error);
    }

    $.ajaxUpload=function (option) {
        return new ajaxUpload(option).init();
    }
})(jQuery);

