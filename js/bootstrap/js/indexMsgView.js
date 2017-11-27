(function(window, $, undefined) {
	$(function() {
		var QUERY_MSG_NUMBER = 5; //查询最新的消息数量
	    var $sideMenu = $('#side-menu'),
	        $pageTabs = $('.page-tabs');
		//进入首页查询一次消息
	    queryNewestMsg();
	    
	    //获取定时查询消息任务句柄
	    var queryMsgTask = setQueryTask();
	    
	    //每隔5分钟查询一次最新消息数量
	    function setQueryTask(){
	    	return setInterval(function(){
	    		queryUnreadMsgNumber();
	        },300000);
	    }
	    
	  //查询未读消息数量
	    function queryUnreadMsgNumber(){
	    	$.ajax({
				type: "post",
				url: "/cbp/msgview/unreadMsgCount.do",
				async: true,
				data: {}
			}).done(function(data){
				if(!data){
					return;
				}
				var msgNumber = data;
		    	var $msgNum = $('#index-msg-number');
		    	var defNum = $msgNum.html();
		    	if (msgNumber != defNum) {
		    		$msgNum.animate({
		    			'top': '-8px',
		    			'opacity': '0'
		    		}, 500, function () {
		    			$msgNum.html(msgNumber);
		    			$msgNum.animate({
		    				'top': '3px',
		    				'opacity': '1'
		    			});
		    		});
		    	}
			}).fail(function(){
				console.log("获取未读数量失败");
			});
	    }
	    
	    //查询最新的几条消息
	    function queryNewestMsg(){
	    	$.ajax({
				type: "post",
				url: "/cbp/msgview/newest.do",
				async: true,
				data: {limit:QUERY_MSG_NUMBER,pageNo:"1"}
			}).done(function(data){
				if(!data){
					return;
				}
				updateNewestMsg(JSON.parse(data));
			}).fail(function(){
				console.log("获取最新消息失败");
			});
	    }
	    
	    //更新页面最新消息列表
	    function updateNewestMsg(data){
	    	var $dropdownMessages = $("#dropdown-messages").empty();
	    	var msgNumber = data.total;
	    	var $msgNum = $('#index-msg-number');
	    	var defNum = $msgNum.html();
	    	if (msgNumber != defNum) {
	    		$msgNum.animate({
	    			'top': '-8px',
	    			'opacity': '0'
	    		}, 500, function () {
	    			$msgNum.html(msgNumber);
	    			$msgNum.animate({
	    				'top': '3px',
	    				'opacity': '1'
	    			});
	    		});
	    	}
	    	var msgItems = data.items || [];
	    	var $msgItemTemplet = $(".dropdown-messages-item-templete");
	    	for(var i=0;i<msgItems.length;i++){
	    		var item = msgItems[i];
	    		var $msgItem = $msgItemTemplet.clone();
	    		$msgItem.find(".dropdown-messages-box").attr("data-id",item.id);
	    		$msgItem.find(".index-msg-title").text(item.title);
	    		$msgItem.find(".index-msg-date").text(item.createDate);
	    		$msgItem.removeClass("dropdown-messages-item-templete").appendTo($dropdownMessages);
	    		$("<li class='divider'></li>").appendTo($dropdownMessages);
	    	}
	    }
	    
	    //标记消息或者置为已读
	    function operateMsg ($this,type){
	    	var url = "";
	    	if(type == "flag"){
	    		url = "/cbp/msgview/flag.do";
	    	}else if(type == "stat"){
	    		url = "/cbp/msgview/view.do";
	    	}
	    	var $msgBox = $this.parents(".dropdown-messages-box");
	    	var msgId = $msgBox.attr("data-id");
	    	$.ajax({
				type: "post",
				url: url,
				async: true,
				data: {msgId:msgId,flag:"1"}
			}).done(function(data){
				if(!data){
					console.log("标记消息失败");
					return;
				}
				var $msgItem = $msgBox.parents(".dropdown-messages-item");
				var $msgDivider = $msgItem.next();
				$msgItem.fadeOut("1000",function(){
					$msgDivider.remove();
					$msgItem.remove();
					var $msgNumber = $("#index-msg-number");
					$msgNumber.animate({
		    			'top': '-8px',
		    			'opacity': '0'
		    		}, 500, function () {
		    			$msgNumber.text($msgNumber.text()-1);
		    			$msgNumber.animate({
		    				'top': '3px',
		    				'opacity': '1'
		    			},function(){
		    				if(!$("#dropdown-messages li").length){
								queryNewestMsg();
							}
		    			});
		    		});
				});
			}).fail(function(){
				console.log("标记消息失败");
			});
	    }
	    
	  //查询有标记的消息
	    function queryFlagMsg(){
	    	$.ajax({
				type: "post",
				url: "/cbp/msgview/msgFlag.do",
				async: true,
				data: {limit:QUERY_MSG_NUMBER,pageNo:"1"}
			}).done(function(data){
				if(!data){
					return;
				}
				updateFlagMsg(JSON.parse(data));
			}).fail(function(){
				console.log("获取标记消息失败");
			});
	    }
	    
	    function updateFlagMsg(data){
	    	var $dropdownMessages = $("#dropdown-messages").empty();
	    	var msgItems = data.items || [];
	    	var $msgItemTemplet = $(".dropdown-messages-item-templete");
	    	for(var i=0;i<msgItems.length;i++){
	    		var item = msgItems[i];
	    		var $msgItem = $msgItemTemplet.clone();
	    		$msgItem.find(".dropdown-messages-box").attr("data-id",item.id);
	    		$msgItem.find(".index-msg-title").text(item.title);
	    		$msgItem.find(".index-msg-date").text(item.createDate);
	    		$msgItem.find(".index-msg-flag").remove();
	    		$msgItem.find(".index-msg-stat").toggleClass("index-msg-stat index-msg-flag-remove").attr("title","取消标记").find("i").toggleClass("fa-flag fa-remove");
	    		$msgItem.removeClass("dropdown-messages-item-templete").appendTo($dropdownMessages);
	    		$("<li class='divider'></li>").appendTo($dropdownMessages);
	    	}
	    }
	    
	    /** 注册点击事件start **/
	    
	    //查看标记消息
	    $('body').on("click",'.index-msg-flag-query',function(){
	    	var $this = $(this);
	    	if($this.find("i").hasClass("fa-flag")){
	    		queryFlagMsg();
	    	}else{
	    		queryNewestMsg();
	    	}
	    	$this.find("i").toggleClass("fa-flag fa-envelope");
			return false;
		});
	    
	    //标记消息
	    $('body').on("click",'.index-msg-flag',function(){
	    	var $this = $(this);
	    	$this.find("i").removeClass("fa-flag-o").addClass("fa-flag");
	    	operateMsg($this,"flag");
	    	return false;
	    });
	    
	    //移除消息
	    $('body').on("click",'.index-msg-stat',function(){
	    	var $this = $(this);
	    	operateMsg($this,"stat");
			return false;
		});
	    
	    //取消标记消息
	    $('body').on("click",'.index-msg-flag-remove',function(){
	    	var $this = $(this);
	    	$this.find("i").toggleClass("fa-flag fa-flag-o");
	    	var url = "/cbp/msgview/flag.do";
	    	var $msgBox = $this.parents(".dropdown-messages-box");
	    	var msgId = $msgBox.attr("data-id");
	    	$.ajax({
				type: "post",
				url: url,
				async: true,
				data: {msgId:msgId,flag:"0"}
			}).done(function(data){
				if(!data){
					console.log("标记消息失败");
					return;
				}
				var $msgItem = $msgBox.parents(".dropdown-messages-item");
				var $msgDivider = $msgItem.next();
				$msgItem.fadeOut("1000",function(){
					$msgDivider.remove();
					$msgItem.remove();
					queryFlagMsg();
				});
			}).fail(function(){
				console.log("标记消息失败");
			});
	    	return false;
	    });
	    
	    $('.index-dropdown-msg').on('show.bs.dropdown', function () {
	    	queryNewestMsg();
	    	//消息列表框打开则关闭定时查询任务
	    	clearInterval(queryMsgTask);
    		queryMsgTask = null;
	    });
	    
	    $('.index-dropdown-msg').on('hidden.bs.dropdown', function () {
	    	var $flag = $(".index-msg-flag-query").find("i");
    		if($flag.hasClass("fa-envelope")){
    			$flag.toggleClass("fa-flag fa-envelope");
    			queryNewestMsg();
    		}
    		//消息列表框关闭则开启定时任务
    		if(!queryMsgTask){
    			queryMsgTask = setQueryTask();
    		}
	    });
	    /** 注册点击事件end **/
	});
})(window, $, undefined);