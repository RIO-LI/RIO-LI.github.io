(function(window, $, undefined) {
    $(function() {
        var $sideMenu = $('#side-menu'),
            $pageTabs = $('.page-tabs'),
            $navTabs = $('.nav-page-tabs'),
            $navContainer = $('.nav-page-container'),
            //默认页
            /*
             * 流程指引暂时隐藏起来
             * defaultPageInfo = {
                url: '#!/cbp/analysis/flow/index.do',
                title: '流程指引'
            };*/
            defaultPageInfo = {
                url: '#!/cbp/resources/modules/wasp/defaultPage.jsp',
                title: 'defaultPage',
                id: '1'
            };
        var msg_t = -1;//通知激活读秒
      	var pnd_t = -1;//待办激活读秒
      	var mnt_t = -1;//监控激活读秒
      	
      	var message_interval = setInterval(function(){
      		msg_t += 1;
      		if ($navTabs.find('li.active').data('title') == 'defaultPage') {
      			msg_t = 0;
      		}
        }, 1000);
      	var pending_interval = setInterval(function(){
      		pnd_t += 1;
      		if ($navTabs.find('li.active').data('title') == 'defaultPage') {
      			msg_t = 0;
      		}
        }, 1000);
      	var monitor_interval = setInterval(function(){
      		mnt_t += 1;
      		if ($navTabs.find('li.active').data('title') == 'defaultPage') {
      			msg_t = 0;
      		}
        }, 1000);

        
        // 菜单搜索
        $('#top-search').keypress(function(e){
        	if(e.keyCode!=13) return;
        	
        	var $title = $(this).val();
        	var $ele = $sideMenu.find('[data-title*="' + $title + '"]');
        	if($ele.length!=0) {
        		setTimeout(function() {
                    $sideMenu
                        .find('.in')
                        .removeClass('in')
                        .end()
                        .find('.active')
                        .removeClass('active');

                    $ele.parents('li')
                        .addClass('active')
                        .end()
                        .parents('ul')
                        .removeAttr('style')
                        .addClass('in');
                }, $ele.parents('.nav > li.active').length ? 0 : 10);
        		
        		 /* 通过搜索自动开启菜单注释掉
        		 var $activeTab = $pageTabs.find('[data-title="' + $title + '"]');
                 if ($activeTab.length) {
                     $activeTab
                         .addClass('active')
                         .siblings()
                         .removeClass('active');
                 } else {
                     //新增nav-page-tabs
                     createPageTabs($ele.attr('data-url'), $title);
                 }*/
        	}
        	$(this).val('');
        });
        
        //绑定侧边栏的事件，点击后生成右边的iframe
        //一般是二级菜单
        $sideMenu.on('click', '.final-menu a', function(e) {
            e.preventDefault();
            //记录菜单点击
            //menuClickLog($(this));  //暂时去掉,不要做记录
            //切换页签
            changePageTabs(getDomInfo($(this)));
        });

        //删除页签
        $pageTabs.on('click', '.nav-page-close', function(e) {
            var $header = $(this).parents('.nav-page-item-header');
            deletePageTabs(getDomInfo($(this)).id, $header.hasClass('active'), $header.siblings().length);
            return false;
        })

        //非活动页签被点击
        .on('click', '.nav-page-item-header:not(.active)', function(e) {
            e.preventDefault();
            //切换页签
            changePageTabs(getDomInfo($(this)));
        });

        //获取dom上保存的信息
        function getDomInfo($dom) {
            return {
                url: $dom.data('url') || false,
                title: $dom.data('title') || false,
                id: $dom.data('id') || false
            }
        }

        //切换页签
        function changePageTabs(info) {
        		var lastPage = $('.active.nav-page-item-header').data('title');
            var url, title, id, $ele;
            if (!info.id) {
                return false;
            }
            
            var id = info.id;
            var url = info.url;
            var title = info.title;
            var $ele = $sideMenu.find('[data-id="' + id + '"]');
            //更新左面的nav-tabs
            setTimeout(function() {
                $sideMenu
                    .find('.in')
                    .removeClass('in')
                    .end()
                    .find('.active')
                    .removeClass('active');

                $ele.parents('li')
                    .addClass('active')
                    .end()
                    .parents('ul')
                    .removeAttr('style')
                    .addClass('in');
            }, $ele.parents('.nav > li.active').length ? 0 : 10);

            //判断是否已经有了这个tab
            var $activeTab = $pageTabs.find('[data-id="' + id + '"]');

            //看看有没有，没有的话只能跳转了
            if ($activeTab.length) {
                $activeTab
                    .addClass('active')
                    .siblings()
                    .removeClass('active');
            } else {
                //新增nav-page-tabs
                createPageTabs(url, title, id);
            }
            
            var currentPage = $('.active.nav-page-item-header').data('title');
            
            //跳往其他页时重置计时器
            if (lastPage == 'defaultPage' && currentPage != 'defaultPage') {
            	msg_t = 0;
            }
            if (lastPage == 'defaultPage' && currentPage != 'defaultPage') {
            	pnd_t = 0;            	
            }
            if (lastPage == 'defaultPage' && currentPage != 'defaultPage') {	
            	mnt_t = 0;
            }
            //回到首页，查看计时并处理
            if (lastPage != 'defaultPage' && currentPage == 'defaultPage') {
            	if (msg_t > firstMsgViewf) {
              	indexApp.getMessageNum();
              }
              if (pnd_t > firstMsgBacklogf) { 
              	indexApp.getPendingNum();
              }
              if (mnt_t > firstMsgMonitorf) { 
              	indexApp.getMonitorNum();
              }
            }
            
            var $num = $('.default-page-index .monitor .num.active');
            if (currentPage == 'defaultPage' && $num.length > 0) {
            	$num.animate({
  		    			'top': '5px',
  		    			'opacity': '0'
  		    		}, 500, function () {
  		    			$num.html('new');
  		    			$num.removeClass('active');
  		    		});
            }
            
        }

        //删除页签，并将最后一个置为活动状态
        //如果是活动页签，就要让最后一个置为活动状态
        //如果这是最后一个页签，那么就要显示默认的页签
        function deletePageTabs(id, isActive, pageTabLength) {
            $pageTabs.find('[data-id="' + id + '"]').remove();

            if (isActive) {
                $pageTabs.find('.nav-page-tabs')
                    .find('.nav-page-item-header')
                    .last()
                    .trigger('click');
            }

            if (pageTabLength == 1) {
                changePageTabs(defaultPageInfo);
            }
        }

        //新增页签
        function createPageTabs(url, title, id) {
            //realUrl是去掉#!之后的url
            var realUrl = url.slice(2);
            if (vaildatePageTabs()) {
               var headerNum =$navTabs.find('.nav-page-item-header').length + 1;
               if(title != 'defaultPage') {
            	   if (title == '流程指引') {
            	  	 $('<li class="active nav-page-item-header nav-page-flow-guide" data-id="' + id + '" data-url="' + url + '" data-title="' + title + '"><i class="fa fa-cogs"></i>' + title + '<i data-id="' + id + '" data-url="' + url + '" class="fa fa-times-circle nav-page-close"></i></li>')
                   .appendTo($navTabs)
                   .siblings()
                   .removeClass('active'); 
            	   }else {
            	  	 $('<li class="active nav-page-item-header" data-id="' + id + '" data-url="' + url + '" data-title="' + title + '">' + title + '<i data-id="' + id + '" data-url="' + url + '" class="fa fa-times-circle nav-page-close"></i></li>')
                   .appendTo($navTabs)
                   .siblings()
                   .removeClass('active');
            	   }
               }else {
              	 $('<li class="active nav-page-item-header" data-id="' + id + '" data-url="' + url + '" data-title="' + title + '"><span class="icon-default-page"></span></li>')
                 .appendTo($navTabs);
               }
                //新增page-container            
                $('<div class="nav-page-item-body active" data-id="' + id + '" data-url="' + url + '" data-title="' + title + '">\
                    <iframe src="' + realUrl + '" id="index-frame'+headerNum+'" data-id="' + id + '" frameborder="0" allowfullscreen mozallowfullscreen webkitallowfullscreen>\
                    </iframe>\
                </div>')
                    .appendTo($navContainer)
                    .siblings()
                    .removeClass('active');
            }
            //监听iframe中的点击事件,用来关闭首页的消息列表
            /*$($("iframe[src='"+realUrl+"']")[0].contentWindow).click(function(){
            	$("body").trigger("click");
            });*/
        }

        function vaildatePageTabs() {
            if ($navTabs.find('.nav-page-item-header').length < 10) {
                return true;
            } else {
                toastr.error('打开页面超过10个，请关闭后再打开。');
                return false;
            }
        }
        
        //点击进入我的消息页面
        $(".btn-message").click(function(){
	    	/*var title = "我的通知";
	    	$ele = $sideMenu.find('[data-title*="' + title + '"]');
	    	if($ele.length!=0) {
	    		setTimeout(function() {
	                $sideMenu
	                    .find('.in')
	                    .removeClass('in')
	                    .end()
	                    .find('.active')
	                    .removeClass('active');
	
	                $ele.parents('li')
	                    .addClass('active')
	                    .end()
	                    .parents('ul')
	                    .removeAttr('style')
	                    .addClass('in');
	            }, $ele.parents('.nav > li.active').length ? 0 : 10);
	    	}
		 	var $activeTab = $pageTabs.find('[data-title="' + title + '"]');
	        if ($activeTab.length) {
	            $activeTab
	                .addClass('active')
	                .siblings()
	                .removeClass('active');
	        } else {
	            //新增nav-page-tabs
	            createPageTabs($ele.attr('data-url'), title);
	        }*/
        	var msgInfo = {
        			url: '#!/cbp/msgview/list.do',
              title: '我的通知',
              id: '2016010174'
        	};
        	changePageTabs(msgInfo);
	    });
        
        window.openTab = function(url){
        	var url = "#!" + url;
        	var $ele = $sideMenu.find('[data-url="' + url + '"]');
        	var id = $ele.data('id');
        	if($ele.length!=0) {
        		setTimeout(function() {
	                $sideMenu
	                    .find('.in')
	                    .removeClass('in')
	                    .end()
	                    .find('.active')
	                    .removeClass('active');
	
	                $ele.parents('li')
	                    .addClass('active')
	                    .end()
	                    .parents('ul')
	                    .removeAttr('style')
	                    .addClass('in');
	            }, $ele.parents('.nav > li.active').length ? 0 : 10);
        	}
        	var $activeTab = $pageTabs.find('[data-id="' + id + '"]');
	        if ($activeTab.length) {
	            $activeTab
	                .addClass('active')
	                .siblings()
	                .removeClass('active');
	        } else {
	            //新增nav-page-tabs
	            createPageTabs($ele.data('url'), $ele.data('title'), id);
	        }
        };
        
        function menuClickLog($menu){
        	var url = $menu.attr("data-url").slice(2);
        	var sourceType = "2";
        	$.ajax({
				type: "post",
				url: "/cbp/analysis/behavior/menuClickLog/click.do",
				async: true,
				data: {sourceType:sourceType,url:url}
			}).done(function(data){
				if(!data){
					console.log("菜单点击记录失败");
					return;
				}
			}).fail(function(){
				console.log("菜单点击记录失败");
			});
        }

        //跳转到默认页
        changePageTabs(defaultPageInfo);
        
        
        //重构新首页添加的JS,控制索引部分的更新
        var indexApp = {
            init: function () {
            	var that = this;
            	this.$defaultPageIndex = $('.default-page-index');
            	
            	this.bind();
            	this.getMessageNum();
            	this.getPendingNum();
            	this.getMonitorNum();
            	var t1 = setInterval(function(){
                that.getMessageNum();
              }, 60000*indexMsgViewf);
            	var t2 = setInterval(function(){
                that.getPendingNum();
              }, 60000*indexMsgBacklogf);
            	var t3 = setInterval(function(){
                that.getMonitorNum();
              }, 60000*indexMsgMonitorf);
            },
            bind: function () {
            	this.$defaultPageIndex.on('click', $.proxy(this.changeToDefaultPage, this));
            },
            //切换到首页
            changeToDefaultPage: function () {
            	changePageTabs(defaultPageInfo);
            },
            //获取监控数
            getMonitorNum: function () {
            	var that = this;
            	$.ajax({
          		  type: "POST",
          			url: "/cbp/msgMonitor/queryMonitorCount.do",
          			data: '',
          			dataType: "json",
          			success: function (data) {
          				if ($('ul.nav-page-tabs .nav-page-item-header[data-title="defaultPage"]').hasClass('active') && $('#index-frame1')[0] != undefined) {
          					$("#index-frame1").contents().find('.monitor span.btn-refresh').click();
          				}
          				var $num = that.$defaultPageIndex.find('.monitor .num');
          				var currentPage = $('.active.nav-page-item-header').data('title');
          				if (data && $num.data('num') == '') {
          					$num.data('num', data);
          					return;
          				}
          				if ($num.data('num') != data && data > 0 && currentPage != 'defaultPage') {
          					$num.addClass('active');
          					$num.animate({
        		    			'top': '5px',
        		    			'opacity': '0'
        		    		}, 500, function () {
        		    			$num.html('new');
        		    			$num.data('num', data);
        		    			$num.animate({
        		    				'top': '15px',
        		    				'opacity': '1'
        		    			});
        		    		});
          				}else {
          					$num.removeClass('active');
          				}
          			}
            	});
            },
            //获取待办数
            getPendingNum: function () {
            	var that = this;
            	$.ajax({
          		  type: "POST",
          			url: "/cbp/msgBacklog/queryBacklogCount.do",
          			data: '',
          			dataType: "json",
          			success: function (data) {
          				var $num = that.$defaultPageIndex.find('.pending .num');
          				if (data > 0) {
          					$num.addClass('active');          					
          				}else {
          					$num.removeClass('active');
          				}
          				$num.animate({
      		    			'top': '5px',
      		    			'opacity': '0'
      		    		}, 500, function () {
      		    			$num.html(data);
      		    			$num.animate({
      		    				'top': '15px',
      		    				'opacity': '1'
      		    			});
      		    		});
          				if ($('ul.nav-page-tabs .nav-page-item-header[data-title="defaultPage"]').hasClass('active') && $('#index-frame1')[0] != undefined) {
          					$("#index-frame1").contents().find('.pending span.btn-refresh').click();
          				}
          			}
            	});
            },
            //获取通知数
            getMessageNum: function () {
            	var that = this;
            	$.ajax({
          		  type: "POST",
          			url: "/cbp/msgview/unreadMsgCount.do",
          			data: '',
          			dataType: "json",
          			success: function (data) {
          				var $num = that.$defaultPageIndex.find('.message .num');
          				if (data > 0) {
          					$num.addClass('active');          					
          				}else {
          					$num.removeClass('active');
          				}
          				$num.animate({
      		    			'top': '5px',
      		    			'opacity': '0'
      		    		}, 500, function () {
      		    			$num.html(data);
      		    			$num.animate({
      		    				'top': '15px',
      		    				'opacity': '1'
      		    			});
      		    		});
          				if ($('ul.nav-page-tabs .nav-page-item-header[data-title="defaultPage"]').hasClass('active') && $('#index-frame1')[0] != undefined) {
          					$("#index-frame1").contents().find('.message span.btn-refresh').click();
          				}
          			}
            	});
            }
        };
        
        indexApp.init();
        
        
        
        
        
        
        
        
        
        
        
        
    });
    
})(window, $, undefined);