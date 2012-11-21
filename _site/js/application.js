!function ($) {
  $(function(){
    $("ul.app-menu li").each(function() {
      var href = $(this).find('a').attr("href");

      if(href == window.location.pathname)
        $(this).addClass("active"); 
      else
        if(window.location.pathname.indexOf(href) == 0 && href != '/')
          $(this).addClass("active"); 
    });
  });
}(window.jQuery);

