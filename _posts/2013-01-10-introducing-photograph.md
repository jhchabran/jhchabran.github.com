---
layout: post
title: Introducing Photograph
category: Rant
tags:
  - Ruby
---

[Photograph](http://github.com/jhchabran/photograph/) is a really simple
gem that provides to take screenshots of webpages as they are rendered
in webkit. Give Photograph the url you want and that's all. 

The interesting part is how easy this was to code !

{% end_excerpt %}

## Throwing gems at it

It's about using Capybara with Polteirgeist (which wraps PhantomJS) to take the screenshot itself, then use MiniMagick 
to crop if needed. Adding some Ruby around it makes the Ruby API : 

{% highlight ruby %}
artist = Artist.new :url => "http://jhchabran.com", :wait => 2

artist.shoot! do |image|
  send_file image.path, :type => "png"
end
{% endhighlight %}

Quite easy isn't it ? Cropping can be done through the optionals
parameters ``:x :y :w :h``. 

Deciding when to take the screenshot is probably the only tricky part.
You can either specify a timer through ``:wait``  or wait for some dive
to appear with ``:selector => ".page"`` for example. 

## As a webservice 

As photograph after all the layers ends by running webkit, it can be
used to produce screenshots reflecting exactly the rendering got an a
platform. The use case we had that led to coding photograph some months ago
was requiring OSX rendering. As we had an iPad client rendering rich
content fetched from the backend, we had to rely on screenshots when
listing the different pages to avoid fully rendering them which would
have been very costly, especially since listing don't need any
interaction at all. 

Well, as we were obviously not hosting our webservice on an OSX machine
but on Heroku, a thin Sinatra layer was added to make calls from Heroku
to Photograph, which was hosted on a Mac. 

```
  GET
http://photograph.somewhere.com/shoot?url=http://jhchabran.com&selector=.page
```

And it answers with a png within 1 to 3 seconds. Wrap that into a
Delayed or Resque Job and problem solved.

Need more photographs ? Spawn more Sinatra instances !

## Good and bad parts

What is really interesting there is the fact the code is so simple that
there's almost no room for bugs besides those that may be carried by the
libraries photograph's relies on. Obviously, Sinatra and Capybara are
robusts, the only small issue we had was on Capybara-Webkit which had
its ``webkit-server`` dying after being online for some hours. Switching
to PhantomJS thanks to Polteirgeist solved the problem.  

But such simple code comes with its limitations. Having GET requests
that takes more than 2 seconds can be irritating. Plus scaling can be
achieved in a much better way than having one webkit instance running
per Sinatra. 

As our use case require tons of screenshots, we finally switched to
Url2Png which worked great so far. As we were already working with SAAS
everywhere it really made sense to add some cash there and let people
focused on that problem solving it for us. 

Nevertheless if taking a few screenshots is all you need, firing some
photograph instance is probably the simplest way to achieve it. 

## Upcoming 

So far, I'm really surprised to see how simple all of this was to write.
Photograph had been successfully used in production on two apps.
Experience shows that adding some features to scale it would improve the
whole usability and decrease the amount of code required to use it. 

I'm currently thinking of adding Resque to photograph, having one
phantomjs instance per worker thus making scaling easy as ``COUNT=5
QUEUE=* rake resque:workers``. The screenshot would be provided
afterward with a POST uploading it to the web app that needs it, with
the url specified in a ``callback`` parameter. 

There also might be some work to be done to detect ``window.onload``
instead of the crappy ``wait`` timer, to speed up the whole process.

## Getting it

[Source are available here](https://github.com/jhchabran/photograph/)
and as a gem ``gem install photograph`` then ``photograph -h 192.168.0.1
-p 8080`` for example. 



