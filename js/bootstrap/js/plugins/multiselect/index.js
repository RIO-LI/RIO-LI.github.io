$(function() {
    //默认为不可用
    (function(){
    	initMultiselect();
    })();

    $('.multiselect').on('click', '.multiselect-item', function() {
            $(this).toggleClass('active');
        })
	    .on('click', '.multiselect-toright', function() {
	        var $selectArea = $('.multiselect');
	        $selectArea.find('.options-body')
	            .find(".multiselect-item")
	            //.removeClass('active')
	            .appendTo($selectArea.find('.selected-body'));
            var rightlength=$selectArea.find('.selected-body').find(".multiselect-item").length;
            if(rightlength>0){
                $(".multiselect-toleft,.multiselect-goleft").attr('disabled',false);
            };
            var leftlength=$selectArea.find('.options-body').find(".multiselect-item").length;
            if(leftlength == 0 && rightlength != 0 ){
                $(".multiselect-toright,.multiselect-goright").attr('disabled',true);
            }
	    })
	    .on('click', '.multiselect-goright', function() {
            var $selectArea = $('.multiselect');
            $selectArea.find('.options-body')
                .find(".multiselect-item.active")
               // .removeClass('active')
                .appendTo($selectArea.find('.selected-body'));
            var rightlength=$selectArea.find('.selected-body').find(".multiselect-item").length;
            if(rightlength>0){
                $(".multiselect-toleft,.multiselect-goleft").attr('disabled',false);
            };
            var leftlength=$selectArea.find('.options-body').find(".multiselect-item").length;
            if(leftlength == 0 && rightlength != 0 ){
                $(".multiselect-toright,.multiselect-goright").attr('disabled',true);
            }
        })
        .on('click', '.multiselect-toleft', function() {
            var $selectArea = $('.multiselect');
            $selectArea.find('.selected-body')
                .find(".multiselect-item")
                .removeClass('active')
                .appendTo($selectArea.find('.options-body'));
            if($selectArea.find('.selected-body').find(".multiselect-item").length == 0){
                $(".multiselect-toleft,.multiselect-goleft").attr('disabled',true);
            };
            if($selectArea.find('.options-body').find(".multiselect-item").length > 0){
                $(".multiselect-toright,.multiselect-goright").attr('disabled',false);
            }
        })
        .on('click', '.multiselect-goleft', function() {
            var $selectArea = $('.multiselect');
            $selectArea.find('.selected-body')
                .find(".multiselect-item.active")
                .removeClass('active')
                .appendTo($selectArea.find('.options-body'));
            if($selectArea.find('.selected-body').find(".multiselect-item").length == 0){
                $(".multiselect-toleft,.multiselect-goleft").attr('disabled',true);
            };
            if($selectArea.find('.options-body').find(".multiselect-item").length > 0){
                $(".multiselect-toright,.multiselect-goright").attr('disabled',false);
            }
        })
        .on('click', '.mulitselect-remove', function(event) {
           // $(this).parents('.multiselect-item').remove();
            var $selectArea = $('.multiselect');
            $(this).parents('.multiselect-item').removeClass('active').appendTo($selectArea.find('.options-body'));
            if($selectArea.find('.selected-body').find(".multiselect-item").length == 0){
                $(".multiselect-toleft,.multiselect-goleft").attr('disabled',true);
            };
            if($selectArea.find('.options-body').find(".multiselect-item").length > 0){
                $(".multiselect-toright,.multiselect-goright").attr('disabled',false);
            }
            event.stopPropagation();
        })
     })
    .on('click', '.multiselect-clearall', function() {
        var $selectArea = $('.multiselect');
        $selectArea.find('.selected-body')
            .find(".multiselect-item")
            .removeClass('active')
            .appendTo($selectArea.find('.options-body'));
        if($selectArea.find('.selected-body').find(".multiselect-item").length == 0){
            $(".multiselect-toleft,.multiselect-goleft").attr('disabled',true);
            $(".multiselect-toright,.multiselect-goright").attr('disabled',false);
        };
    })
    .on('click', '.multiselect-goup', function() {
        var $item = $('.multiselect').find('.selected-body').find(".multiselect-item.active")
        $.each($item, function(k,t) {
            var $t = $(t);
            var $prev = $t.prev();
            if ($prev.length) {
                $t.insertBefore($prev);
            }
        })
    })
    .on('click', '.multiselect-godown', function() {
        var $item = $('.multiselect').find('.selected-body').find(".multiselect-item.active")
        for (var i = $item.length; i >= 0; i--) {
            (function(t) {
                var $t = $(t);
                var $next = $t.next();
                if ($next.length) {
                    $next.after($t);
                }
            })($item.eq(i));
        }
    })
    .on('click', '.multiselect-totop', function() {
        var $body = $('.multiselect').find('.selected-body')
        var $item = $body.find(".multiselect-item.active")
        $item.prependTo($body);
    })
    .on('click', '.multiselect-tobottom', function() {
        var $body = $('.multiselect').find('.selected-body')
        var $item = $body.find(".multiselect-item.active")
        $item.appendTo($body);
    });
function initMultiselect(){
	 var $selectArea = $('.multiselect');
     if($selectArea.find('.selected-body').find(".multiselect-item").length > 0){
         $(".multiselect-toleft,.multiselect-goleft").attr('disabled',false);
     }else{
		 $(".multiselect-toleft,.multiselect-goleft").attr('disabled',true);
     };
     if($selectArea.find('.options-body').find(".multiselect-item").length > 0){
         $(".multiselect-toright,.multiselect-goright").attr('disabled',false);
     }else{
    	 $(".multiselect-toright,.multiselect-goright").attr('disabled',true);
     }
	
	
}