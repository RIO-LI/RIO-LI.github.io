(function(factory) {
    if (typeof define == 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory();
    }
})(function() {

    function Upload(config) {
        this.config = config;
        return this.init(config);
    }

    Upload.prototype = {
        constrator: 'Upload',
        init: function(config) {
            var self = this;
            this.$container = $(config.container);
            this.multiple = config.multiple || false;
            this.previewHandle = config.previewHandle || this.previewHandle;
            this.showError = config.showError || this.showError;

            //日期转换函数
            this.dateFormat = function(format, date) {
                date = date ? new Date(date) : new Date;
                format = config.format || 'yyyy/MM/dd hh:mm:ss';
                var map = {
                    "M": date.getMonth() + 1, //月份 
                    "d": date.getDate(), //日 
                    "h": date.getHours(), //小时 
                    "m": date.getMinutes(), //分 
                    "s": date.getSeconds(), //秒 
                    "q": Math.floor((date.getMonth() + 3) / 3), //季度 
                    "S": date.getMilliseconds() //毫秒 
                };
                format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
                    var v = map[t];
                    if (v !== undefined) {
                        if (all.length > 1) {
                            v = '0' + v;
                            v = v.substr(v.length - 2);
                        }
                        return v;
                    } else if (t === 'y') {
                        return (date.getFullYear() + '').substr(4 - all.length);
                    }
                    return all;
                });
                return format;
            };

            if (typeof config.loadingPreview == 'string') {
                this.loadingPreview = function(f) {
                    return config.loadingPreview;
                };
            } else if (typeof config.loadingPreview == 'function') {
                this.loadingPreview = function(f) {
                    return config.loadingPreview.call(self, f);
                }
            }
            else {
                this.loadingPreview = function(f) {
                    return $('<tr class="uploading">\
                                <td><a href="javascirpt:void(0);" style="opacity: .5;">{{name}}</a></td>\
                                <td style="opacity: .5;">{{date}}</td>\
                                <td>正在上传...<span class="f-progress">0</span>%</td>\
                                <td><a href="javascript:void(0)" class="btn-link f-cancel">取消上传</a></td>\
                            </tr>'
                            .replace('{{name}}', f.name));
                };
            }

            if (typeof config.donePreview == 'string') {
                this.donePreview = function(f) {
                    return config.donePreview;
                };
            } else if (typeof config.donePreview == 'function') {
                this.donePreview = function(f) {
                    return config.donePreview.call(self, f);
                }
            }
            else {
                this.donePreview = function(f) {
                    return $('<tr class="uploaded">\
                                <td><a href="javascirpt:void(0);">{{name}}</a></td>\
                                <td>{{date}}</td>\
                                <td>已上传</td>\
                                <td><a href="javascript:void(0)" class="btn-link f-delete" title="删除"><i class="fa fa-trash-o"></i></a></td>\
                            </tr>'
                            .replace('{{name}}', f.name)
                            .replace('{{date}}', self.dateFormat.call(self)));
                };
            }

            if (typeof config.failPreview == 'string') {
                this.failPreview = function(f) {
                    return config.failPreview;
                };
            } else if (typeof config.failPreview == 'function') {
                this.failPreview = function(f) {
                    return config.failPreview.call(self, f);
                }
            }
            else {
                this.failPreview = function(f) {
                    return $('<tr class="upload-error text-danger">\
                                <td><a href="javascirpt:void(0);" class="text-danger">{{name}}</a></td>\
                                <td>{{date}}</td>\
                                <td>上传出错</td>\
                                <td><a href="javascript:void(0)" class="btn-link f-delete" title="删除"><i class="fa fa-trash-o"></i></a></td>\
                            </tr>'
                            .replace('{{name}}', f.name)
                            .replace('{{date}}', self.dateFormat.call(self)));
                };
            }

            this.$uploadButton = $(config.uploadButton);

            this.bindEvent();
        },
        bindEvent: function() {
            var self = this;

            //上传按钮
            this.$uploadButton.on('click', function() {
                var isDisabled = this.hasAttribute('disabled') && this.getAttribute('disabled') != 'false';
                if(!isDisabled) {
                    self.createElement.call(self);
                }
            });

            this.$container.on('click', '.f-cancel', function() {
                $(this).data('upload-ajax').abort();
                $(this).parents('tr').remove();
            })

        },
        //创建input[type]
        createElement: function() {
            var hiddenFileInput = document.createElement('input');
            hiddenFileInput.setAttribute("type", "file");
            hiddenFileInput.onchange = this.inputChange.bind(this);
            hiddenFileInput.style.visibility = "hidden";
            hiddenFileInput.style.position = "absolute";
            hiddenFileInput.style.top = "0";
            hiddenFileInput.style.left = "0";
            hiddenFileInput.style.height = "0";
            hiddenFileInput.style.width = "0";

            if(this.multiple) {
                hiddenFileInput.multiple = true;
            }
            document.body.appendChild(hiddenFileInput);
            hiddenFileInput.click();
        },
        inputChange: function(e) {
            var file = (e.target || e).files;
            var self = this;
            for(var i = 0, len = file.length; i < len; i ++ ){
                (function(t, f){
                    t.detectFile(f) && t.showFile(f);
                })(self, file[i]);
            }
        },
        //判断文件是否合规
        //或者是否超过数量
        detectFile: function(f) {
            var self = this;
            var flag = true;
            if (self.config.type && self.config.type.indexOf(f.type) == -1) {
                self.showError({ msg: '文件类型不对', file: f});
                flag = false;
            } else if (self.config.size && f.size > self.config.size) {
                self.showError({ msg: '文件大小不对', file: f});
                flag = false;
            } else if (self.config.length && self.config.length <= self.$container.find('.uploaded, .uploading').length) {
                self.showError({ msg: '已超出最大可上传文件数量', file: f});
                flag = false;
            }
            return flag;
        },
        //显示错误
        showError: function(d) {
            alert(e.file.name + ":" + d.msg);
        },
        //文件展示
        showFile: function(f) {
            var $preview = $(this.previewHandle(f, this.loadingPreview));
            var self = this;
            self.$container.append($preview);

            (function(f, $p) {
                self.upload(f, $p);
            })(f, $preview);
        },
        //文件上传函数
        upload: function(f, $p) {
            var self = this;
            var fd = new FormData();
            fd.append('file', f);
            for (var d in self.data) {
                fd.append(d, self.data[d]);
            }

            var _ajax = $.ajax({
                    url: self.config.url,
                    contentType: false,
                    processData: false,
                    data: fd,
                    type: 'post',
                    dataType: 'json',
                    xhr: function() {
                        var xhr = new XMLHttpRequest();
                        var $progress = $p.find('.f-progress');
                        xhr.withCredentials = true;
                        xhr.upload.addEventListener('progress', function(e) {
                            if (e.lengthComputable) {
                                $progress.text((e.loaded / e.total * 100).toFixed(1));
                            }
                        });
                        return xhr;
                    }
                })
                .done(function(data) {
                    //处理预览的DOM
                    $p.replaceWith(self.previewHandle(f, self.donePreview))
                })
                .fail(function(xhr, status) {
                    if (status != 'abort') {
                        //处理预览的DOM
                        $p.replaceWith(self.previewHandle(f, self.failPreview));
                    }
                })

            $p.find('.f-cancel').data('upload-ajax', _ajax);
        },
        //文件预览函数处理
        previewHandle: function(f, tplFn) {
            return $(tplFn(f));
        }
    }

    $.fn.upload = function(options) {
        var returnVal = this;
        this.each(function(key, the) {
            new Upload($.extend(true, { uploadButton: the }, options));
        })
        return returnVal;
    };
})
