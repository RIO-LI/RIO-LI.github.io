$(function(){

  var defaultPageApp = {
    init: function () {
    	this.$pending = $('.pending');
    	this.$monitor = $('.monitor');
    	this.$message = $('.message');
    	this.QUERY_MSG_NUMBER = 10;//设定查询最新的消息条数
    	
    	this.bind();
    	this.mustache();
    	this.getMessage();
    	this.getPending();
    	this.getMonitor();
    	this.draggableInit();
    	$( ".section-con" ).disableSelection();
    	this.getIncr();
    },
    bind: function () {
    	this.$pending.on('click', 'span.item-num.active', $.proxy(this.pendingHref, this));
    	this.$pending.on('click', 'span.btn-refresh', $.proxy(this.getPending, this));
    	this.$monitor.on('click', 'span.can-jump', $.proxy(this.monitorHref, this));
    	this.$monitor.on('click', 'span.btn-refresh', $.proxy(this.getMonitor, this));
    	this.$message.on('click', 'span.btn-refresh', $.proxy(this.getMessage, this));
    	this.$message.on('click', '.section-con i.fa-flag', $.proxy(this.markOrDeleteMessage, this));
    	this.$message.on('click', '.section-con i.fa-times', $.proxy(this.markOrDeleteMessage, this));
    	this.$message.on('click', '.section-head i.fa-flag', $.proxy(this.viewMarkMessage, this));
    	this.$message.on('click', '.section-con i.fa-flag', $.proxy(this.cancelMarkMessage, this));
    	this.$message.on('click', '.section-head span.meta', $.proxy(this.jumpToMoreMessage, this));
    },
    //获取增量数据
    getIncr: function () {
    	var $body = $('body', window.parent.document);
    	var num1 = $body.data('existValue');
    	var val1 = $body.data('rate');
    	var num2 = $body.data('existValueMz');
    	var val2 = $body.data('rateMz');
    	$('#zd').html(num1);
    	$('.scale span.val').html(val1);
    	$('#mz').html(num2);
    	var index = val2.indexOf('%');
    	if (parseFloat(val2.substring(0, index)) <= 15) {
    		$('.progress .progress-bar').css('width', '15%');
    	}else {    		
    		$('.progress .progress-bar').css('width', val2);
    	}
    	$('.progress .sr-only').html(val2);
    	if (val1.indexOf('-') > -1) {
    		$('.scale i.fa-arrow-up').addClass('rotate');
    	}
    },
    //页签数量验证
    vaildatePageTabs: function () {
    	var $navTabs = $('.nav-page-tabs', window.parent.document);
    	if ($navTabs.find('.nav-page-item-header').length < 10) {
        return true;
    	} else {
        toastr.error('打开页面超过10个，请关闭后再打开。');
        return false;
    	}
    },
    //拖动功能初始化
    draggableInit: function () {
    	var that = this;
    	//待办拖动初始化
    	this.$pending.children('.section-con').sortable({
        placeholder: "ui-state-highlight",
        handle: 'i.fa-bars',
        revert: true,
        containment: 'parent',
        axis: 'y',
        update: function (e, ui) {
        	var $this = $(ui.item[0]);
        	var $items = $this.parent().children('.item');
        	var arr = [];
        	var user = $('body').data('currentUser');
        	var c_name = user + 'order';
        	var c_value = $items.map(function(){
        		return $(this).data('id');
        	}).get().join(',');
        	that.setCookies(c_name, c_value, 30);
        }
      });
    	
    	//监控拖动初始化
    	this.$monitor.children('.section-con').sortable({
        placeholder: "ui-state-highlight",
        handle: 'i.fa-bars',
        revert: true,
        containment: 'parent',
        axis: 'y',
        update: function (e, ui) {
        	var $this = $(ui.item[0]);
        	var $items = $this.parent().children('.item');
        	var arr = [];
        	var user = $('body').data('currentUser');
        	var c_name = user + 'MonitorOrder';
        	var c_value = $items.map(function(){
        		return $(this).data('id');
        	}).get().join(',');
        	that.setCookies(c_name, c_value, 30);
        }
      });
    },
    //读取cookie设置监控表格自选
    setMonitorDraggableBox: function (data) {
    	var user = $('body').data('currentUser');
    	var c_name = user + 'MonitorOrder';
    	var c_items = this.getCookies(c_name);
    	if (c_items == '') {
    		var result = data;
    	}else {
    		var items = c_items.split(',');
      	var arr = [];
      	var result = [];
      	for (var i = 0; i < items.length; i++) {
		  		$.each(data, function () {    			
		  			if (items[i] == this.id) {
		  				result.push(this);
		  				this['mark'] = 1;
		  			}
		  		});
    		}
      	$.each(data, function () {
      		if (this.mark != 1) {		  				
      			arr.push(this);
      		}
      	});
      	result = result.concat(arr);
    	}
    	var d = {};
    	d.result = result;
    	$.each(d.result, function (){
    		var day = this['backlogOrMonitorTime'].substring(0,10);
    		var time = this['backlogOrMonitorTime'].substring(11,16);
    		var nowDate = $('body',window.parent.document).data('nowDate');
    		if (day == nowDate) {
    			this['time1'] = time;
    		}else {
    			this['time1'] = day;
    		}
    		this['time2'] = time;
    	});
    	var $tpl = $('#temple2').html();
    	var html = Mustache.render($tpl, d);
    	$('.monitor .section-con').html(html);
    	$('.monitor .section-con .item .item-text span').popover({
				title:"内容",
				placement:"top",
				container:"body",
				trigger:"focus",
				animation:false
			});
    	$('.popover').remove();
    },
    //读取cookie设置待办表格自选
    setDraggableBox: function (data) {
    	var user = $('body').data('currentUser');
    	var c_name = user + 'order';
    	var c_items = this.getCookies(c_name);
    	if (c_items == '') {
    		var result = data;
    	}else {
    		var items = c_items.split(',');
      	var arr = [];
      	var result = [];
      	
      	for (var i = 0; i < items.length; i++) {
		  		$.each(data, function () {    			
		  			if (items[i] == this.id) {
		  				result.push(this);
		  				this['mark'] = 1;
		  			}
		  		});
      	}
      	$.each(data, function () {
      		if (this.mark != 1) {		  				
      			arr.push(this);
      		}
      	});
      	result = result.concat(arr);
    	}
    	var d = {};
    	d.result = result;
    	$.each(d.result, function () {
    		if (this.backlogOrMonitors > 0) {
    			this['isActive'] = true;
    		}else {
    			this['isActive'] = false;
    		}
    	});
    	var $tpl = $('#temple1').html();
    	var html = Mustache.render($tpl, d);
    	$('.pending .section-con').html(html);
    	$('.pending .section-con .item .item-text span').popover({
				title:"内容",
				placement:"top",
				container:"body",
				trigger:"focus",
				animation:false
			});
    	$('.popover').remove();
    },
    //取Cookies
    getCookies: function (c_name) {
    	if (document.cookie.length>0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) { 
          c_start = c_start + c_name.length+1;
          var c_end = document.cookie.indexOf(";",c_start);
          if (c_end == -1) {
          	c_end = document.cookie.length;
          }
          return unescape(document.cookie.substring(c_start,c_end))
        } 
      }
      return ""
    },
    //设置Cookies
    setCookies: function (c_name,value,expiredays) {
    	var exdate = new Date();
    	exdate.setDate(exdate.getDate()+expiredays);
    	document.cookie = c_name+ "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString() + ";path=/");
    },
    //去更多通知页
    jumpToMoreMessage: function () {
    	$('.message .btn-message', window.parent.document).click();
    	$('.nav-page-item-header[data-title="我的通知"]', window.parent.document).click();
    },
    //取消已标记的通知
    cancelMarkMessage: function (e) {
    	var that = this;
    	var $this = $(e.currentTarget);
    	if (!$this.hasClass('active')) {
    		return;
    	}
    	var msgId = $this.data('id');
    	$.ajax({
  		  type: "POST",
  			url: path + "msgview/flag.do",
  			data: {msgId:msgId,flag:"0"},
  			dataType: "json",
  			success: function (data) {
  				if(!data){
  					console.log("取消标记消息失败");
  					return;
  				}
  				var $item = $this.parent().parent();
  				$item.fadeOut("1000",function(){
  					$item.remove();
  					that.getMarkMessage();
  				});
  			}
    	});
    },
    //查询已标记的通知
    getMarkMessage: function () {
    	var that = this;
    	$.ajax({
  		  type: "POST",
  			url: path + "msgview/msgFlag.do",
  			data: {limit:this.QUERY_MSG_NUMBER,pageNo:"1"},
  			dataType: "json",
  			success: function (data) {
  				if (data.items.length == 0) {
  					var html = '<p class="no-message">您无已标记通知</p>';
  					$('.message .section-con').html(html);
  					return;
  				}
  				var d = {};
  	    	d.result = data.items;
  	    	$.each(d.result, function (){
  	    		var day = this['createDate'].substring(0,5);
  	    		var time = this['createDate'].substring(6,14);
  	    		var nowDate = $('body',window.parent.document).data('nowDate');
  	    		if (day == nowDate) {
  	    			this['time1'] = time;
  	    		}else {
  	    			this['time1'] = day;
  	    		}
  	    		this['time2'] = time;
  	    	});
  	    	var $tpl = $('#temple4').html();
  	    	var html = Mustache.render($tpl, d);
  	    	$('.message .section-con').html(html);
  			}
    	});
    },
    //查看已标记的通知
    viewMarkMessage: function (e) {
    	var $this = $(e.currentTarget);
    	if ($this.hasClass('active')) {
    		$this.removeClass('active');
    		this.getMessage();
    	}else {
    		$this.addClass('active');
    		this.getMarkMessage();
    	}
    },
    //标记或删除通知
    markOrDeleteMessage: function (e) {
    	var that = this;
    	var $this = $(e.currentTarget);
    	var url = '';
    	if ($this.hasClass('active')) {
    		return;
    	}
    	if($this.hasClass('fa-flag')){
    		url = "msgview/flag.do";
    	}else if($this.hasClass('fa-times')){
    		url = "msgview/view.do";
    	}
    	var msgId = $this.data('id');
    	$.ajax({
  		  type: "POST",
  			url: path + url,
  			data: {msgId:msgId,flag:"1"},
  			dataType: "json",
  			success: function (data) {
  				if(!data){
  					console.log("标记消息失败");
  					return;
  				}
  				var $item = $this.parent().parent();
  				$item.fadeOut("1000",function(){
  					$item.remove();
  					var $num = $('.default-page-index .message .num',window.parent.document);
  					$num.animate({
  		    			'top': '5px',
  		    			'opacity': '0'
  		    		}, 500, function () {
  		    			$num.text(parseInt($num.text())-1);
  		    			if (parseInt($num.text()) < 1) {
  		    				$num.removeClass('active');
  		    			}
  		    			$num.animate({
  		    				'top': '15px',
  		    				'opacity': '1'
  		    			},function(){
  								that.getMessage();
  		    			});
  		    		});
  				});
  				
  			}
    	});
    },
    //获取通知信息
    getMessage: function () {
    	var that = this;
    	$.ajax({
  		  type: "POST",
  			url: path + "msgview/newest.do",
  			data: {limit:this.QUERY_MSG_NUMBER,pageNo:"1"},
  			dataType: "json",
  			success: function (data) {
  				if (data.items.length == 0) {
  					var html = '<p class="no-message">您无新的通知</p>';
  					$('.message .section-con').html(html);
  					return;
  				}
  				var d = {};
  	    	d.result = data.items;
  	    	$.each(d.result, function (){
  	    		var day = this['createDate'].substring(0,5);
  	    		var time = this['createDate'].substring(6,14);
  	    		var nowDate = $('body',window.parent.document).data('nowDate');
  	    		if (day == nowDate) {
  	    			this['time1'] = time;
  	    		}else {
  	    			this['time1'] = day;
  	    		}
  	    		this['time2'] = time;
  	    	});
  	    	var $tpl = $('#temple3').html();
  	    	var html = Mustache.render($tpl, d);
  	    	$('.message .section-con').html(html);
  	    	$('.message .section-con .item .item-text span').popover({
  					title:"内容",
  					placement:"bottom",
  					container:"body",
  					trigger:"focus",
  					animation:false
  				});
  	    	$('.popover').remove();
  			}
    	});
    },
    //监控跳转
    monitorHref: function (e) {
    	if (!this.vaildatePageTabs()) {
    		return;
    	}
    	var $this = $(e.currentTarget);
    	var id = $this.data('id');
    	var url = $this.data('url');
    	var param = $this.data('monitorParameter');
    	url = url + '?parameter=' + param;
    	var $navTabs = $('.nav-page-tabs', window.parent.document);
    	var $navContainer = $('.nav-page-container', window.parent.document);
    	$navTabs.find('li[data-id="' + id + '"]').remove();
    	$navContainer.find('li[data-id="' + id + '"]').remove();
    	var headerNum =$navTabs.find('.nav-page-item-header').length + 1;
    	var $sideMenu = $('#side-menu', window.parent.document);
    	var $ele = $sideMenu.find('a[data-id="' + id + '"]');
    	var title = $ele.data('title');
    	var tab = '<li class="nav-page-item-header active" data-id="' + id + '" data-url="#!/cbp/' + url + '" data-title="' + title + '">' + title + '<i class="fa fa-times-circle nav-page-close active" data-id="' + id + '" data-url="#!/cbp/' + url + '"></i></li>';
    	var contain = '<div class="nav-page-item-body active" data-id="' + id + '" data-url="#!/cbp/' + url + '" data-title="' + title + '"><iframe id="index-frame'+headerNum+'" src="/cbp/' + url + '" data-id="' + id + '" frameborder="0" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe></div>';
    	$(tab).appendTo($navTabs).siblings().removeClass('active');
    	$(contain).appendTo($navContainer).siblings().removeClass('active');
    	$sideMenu.find('.in').removeClass('in').end().find('.active').removeClass('active');
    	$ele.parents('li').addClass('active').end().parents('ul').removeAttr('style').addClass('in');
    },
    //待办跳转
    pendingHref: function (e) {
    	if (!this.vaildatePageTabs()) {
    		return;
    	}
    	var $this = $(e.currentTarget);
    	var id = $this.data('id');
    	var url = $this.data('url');
    	var param = $this.data('backlogParameter');
    	url = url + '?parameter=' + param;
    	var $navTabs = $('.nav-page-tabs', window.parent.document);
    	var $navContainer = $('.nav-page-container', window.parent.document);
    	$navTabs.find('li[data-id="' + id + '"]').remove();
    	$navContainer.find('li[data-id="' + id + '"]').remove();
    	var headerNum =$navTabs.find('.nav-page-item-header').length + 1;
    	var $sideMenu = $('#side-menu', window.parent.document);
    	var $ele = $sideMenu.find('a[data-id="' + id + '"]');
    	var title = $ele.data('title');
    	var tab = '<li class="nav-page-item-header active" data-id="' + id + '" data-url="#!/cbp/' + url + '" data-title="' + title + '">' + title + '<i class="fa fa-times-circle nav-page-close active" data-id="' + id + '" data-url="#!/cbp/' + url + '"></i></li>';
    	var contain = '<div class="nav-page-item-body active" data-id="' + id + '" data-url="#!/cbp/' + url + '" data-title="' + title + '"><iframe id="index-frame'+headerNum+'" src="/cbp/' + url + '" data-id="' + id + '" frameborder="0" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe></div>';
    	$(tab).appendTo($navTabs).siblings().removeClass('active');
    	$(contain).appendTo($navContainer).siblings().removeClass('active');
    	$sideMenu.find('.in').removeClass('in').end().find('.active').removeClass('active');
    	$ele.parents('li').addClass('active').end().parents('ul').removeAttr('style').addClass('in');
    },
    //初始化模板
		mustache: function () {
			var $tpl1 = $('#temple1').html();
			var $tpl2 = $('#temple2').html();
			var $tpl3 = $('#temple3').html();
			var $tpl4 = $('#temple4').html();
			Mustache.parse($tpl1);
			Mustache.parse($tpl2);
			Mustache.parse($tpl3);
			Mustache.parse($tpl4);
		},
		//获取待办
		getPending: function () {
			var that = this;
			$.ajax({
  		  type: "POST",
  			url: path + "msgBacklog/queryBacklog.do",
  			data: '',
  			dataType: "json",
  			success: function (data) {
  				if (data.length == 0) {
  					
  					return;
  				}
  	    	that.setDraggableBox(data);
  	    	$('.popover').remove();
  			}
    	});
		},
		//获取监控
		getMonitor: function () {
			var that = this;
			$.ajax({
  		  type: "POST",
  			url: path + "msgMonitor/queryMonitor.do",
  			data: '',
  			dataType: "json",
  			success: function (data) {
  				if (data.length == 0) {
  					
  					return;
  				}
  				that.setMonitorDraggableBox(data);
  	    	$('.popover').remove();
  			}
    	});
		}
  };

  defaultPageApp.init();
});