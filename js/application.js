!function ($) {
  // Google Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', '{{site.google_analytics}}']);
  _gaq.push(['_trackPageview']);

  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

  $(function(){
    $("ul.app-menu li").each(function() {
      var href = $(this).find('a').attr("href");

      if(href == window.location.pathname)
        $(this).addClass("active"); 
      else
        if(window.location.pathname.indexOf(href) == 0 && href != '/')
          $(this).addClass("active"); 
    });

    $('a[href*=jhchabran-20]').click(function() {
        var myTracker=_gat._getTrackerByName();
        _gaq.push(['myTracker._trackEvent', "affiliates-amazon" , 'click' ]);
        setTimeout('document.location = "' + this.href + '"', 100)
        return false
    });
  });
}(window.jQuery);

