(function(factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    'use strict';

    var Dialog = function(options){
        this.title;
        this.content;
        this.width;
        this.height;
        this.fixed;
        this.$main;
        this.$dialog;
        this.$shadow;
        this.$closeBtn;
        this.$buttonBox;
        this.button;
        this.buttonTarget;
        this.ok;
        this.okValue;
        this.cancel;
        this.cancelValue;
        this.cancelDisplay;
        this.options;
        this.originalOptions;
        this.init(options);
    }

    //弹窗个数
    var count = 0;
    var wrapperHTML = ['<div class="d-dialog">',
        '<div class="d-wrapper">',
            '<div class="d-close"></div>',
            '<div class="d-main">',
                '<div class="d-title">#{title}</div>',
                '<div class="d-content">#{content}</div>',
                '<div class="d-bottom"></div>',
            '</div>',
        '</div>',
    '</div>',
    '<div class="d-shadow"></div>'].join("");

    Dialog.DEFAULTS = {
        id: (new Date() - 0) + count,
        title: "Dialog",
        content: "这是Dialog",
        width: "auto",
        height: "auto",
        okValue: "确定",
        cancelValue: "取消",
        cancelDisplay: true,
        fixed: true,
        autofocus: true
    }

    $.extend(Dialog.prototype, {
        _center : function(){

            var d = this.$dialog;
            var $window = $(window);
            var $document = $(document);
            var fixed = this.options.fixed;
            var dl = fixed ? 0 : $document.scrollLeft();
            var dt = fixed ? 0 : $document.scrollTop();
            var ww = $window.width();
            var wh = $window.height();
            var ow = d.width();
            var oh = d.height();
            var left = (ww - ow) / 2 + dl;
            var top = (wh - oh) * 382 / 1000 + dt;// 黄金比例
            var style = d[0].style;

            style.left = Math.max(parseInt(left), dl) + 'px';
            style.top = Math.max(parseInt(top), dt) + 'px';
        }
    });

    $.extend(Dialog.prototype, {
        init: function(options){

            this.options = this.getOptions(options);
            this.originalOptions = this.options;

            var tmp = Utility.template(wrapperHTML, this.options),
                id = this.options.id,
                that = this;

            this.$main = $(tmp);
            this.$closeBtn = this.$main.find(".d-close");
            this.$dialog = this.$main.siblings(".d-dialog");
            this.$shadow = this.$main.siblings(".d-shadow");
            this.$buttonBox = this.$main.find(".d-bottom");

            this.$dialog.attr("id", id);

            //this.$main.width(this.options.width);
            //this.$main.height(this.options.height);

            //bind close btn
            $(document).on("click", ".d-close", function(e){
                
                that.remove();

                e.stopPropagation();
            });

            count ++;
        },

        create: function(){
            // button handle
            this.options = this.getOptions(this.originalOptions);

            var options = this.options;
            if (!$.isArray(options.button)) {
                options.button = [];
            }
            // title设置
            if (!options.title) {
                this.$main.find(".d-title").remove();
            };

            // 确定按钮
            if (options.ok) {
                options.button.push({
                    id: 'ok',
                    value: options.okValue,
                    callback: options.ok,
                    autofocus: true
                });
            }

            // 取消按钮
            if (options.cancel) {
                options.button.push({
                    id: 'cancel',
                    value: options.cancelValue,
                    callback: options.cancel,
                    display: options.cancelDisplay
                });
            }

            this.button(options.button);

            if (!options.button.length) {
                this.$main.find(".d-bottom").remove();
            };

        },

        //get default config
        getDefaults: function(){
            return Dialog.DEFAULTS;
        },

        //get options
        getOptions: function(options){
            return $.extend(true, {}, this.getDefaults(), options);
        },

        //show
        show: function(data){

            if (data && data.target) {
                this.buttonTarget = data.target;
            };
            
            this.create();
            $("body").append(this.$main);
            this._center();
            this.$dialog.show();
            this.$shadow.show();

            if (this.options.onshow) {
                this.options.onshow(data);
            };

            //focus control
            //若不控制焦点，enter回车键会触发dialog弹出按钮，而出现第二次弹窗
            //并且完成焦点控制后，当窗口弹出，用户可以直接输入内容
            var $inputArr = this.$dialog.find("input, textarea, select").not("input[type='button']"),
                $buttonArr = this.$dialog.find("input[type='button'], input[type='submit'], button, a");

            //先判断是否有表单，先聚焦表单
            setTimeout(function(){
                 $inputArr.length ? $inputArr[0].focus() : ($buttonArr[0] && $buttonArr[0].focus());
            }, 0);

            return this;
        },

        //hide dialog
        close: function(){
            this.$main.hide();
            return this;
        },

        //remove dialog
        remove: function(){
            this.$main.remove();
            delete $.dialog.list[this.id];

            if (this.options.onremove) {
                this.options.onremove();
            };

            return this;
        },

        //button定义，arg
        button: function(args){
            args = args || [];
            var that = this;
            var html = '';
            var number = 0;
            this.callbacks = {};
            
            if (typeof args === 'string') {
                html = args;
                number ++;
            } else {
                $.each(args, function (i, val) {

                    var id = val.id = val.id || val.value;
                    var style = '';
                    that.callbacks[id] = val.callback;

                    if (val.display === false) {
                        style = ' style="display:none"';
                    } else {
                        number ++;
                    }

                    html +=
                      '<button'
                    + ' type="button"'
                    + ' class="btn"'
                    + ' i-id="' + id + '"'
                    + style
                    + (val.disabled ? ' disabled' : '')
                    + (val.autofocus ? ' autofocus class="ui-dialog-autofocus"' : '')
                    + '>'
                    + val.value
                    + '</button>';

                    that.$buttonBox
                    .on('click', '[i-id=' + id +']', function (e) {                
                        var $this = $(this);
                        if (!$this.attr('disabled')) {
                            // IE BUG
                            that._trigger(id);
                        }
                        e.preventDefault();
                    });

                });
            }

            this.$buttonBox.html(html);
            return this;
        },

        setTitle: function(str){
            this.$main.find(".d-title").text(str);
            return this;
        },

        focus: function(){

        },

        blur: function(){

        },

        //button
        ok: function(){

        },

        cancel: function(){

        },

        // 触发按钮回调函数
        _trigger: function (id) {
            var fn = this.callbacks[id];
                
            return typeof fn !== 'function' || fn.call(this) !== false ?
                this.close().remove() : this;
        }
    });
    
    //event
    $.extend(Dialog.prototype, {
        onshow: function(){

        },

        onclose: function(){

        },

        onfocus: function(){

        },

        onbeforeremove: function(){

        },

        onremove: function(){

        },

        onblur: function(){

        }

    });

    $.dialog = function(options){
        var id = Dialog.DEFAULTS.id;
        if (options.id) { id = options.id };
        return $.dialog.list[id] = new Dialog(options);
    }

    $.dialog.list = {};
    $.dialog.get = function(id){
        return id === undefined ? $.dialog.list : $.dialog.list[id];
    };


    //extend
    $.tips = function(c, callback){
        var tip = $.dialog({
            title: "提示",
            content: c,
            cancel: function(){},
            cancelValue: "关闭",
            onremove: function(){
                if (callback) {callback()};
            }
        });

        tip.show();
    }


}));
