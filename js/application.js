!function ($) {
  $(function(){
    $("ul.app-menu li").each(function() {
      if($(this).find('a').attr("href") == window.location.pathname)
        $(this).addClass("active"); 
    });
  });
}(window.jQuery);

