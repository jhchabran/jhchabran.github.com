---
date: 2011-12-17
author: J.H. Chabran
layout: post
title: Build a chrome extension with Coffee Script
category: CoffeeScript
tags:
  - CoffeScript
  - Chrome
  - Javascript
---
Ever had an idea for a great Chrome Extension ? Did you know that a
chrome extension is just javascript ? And where there's Javascript, we
can write some CoffeeScript !

This post aims to give you an overview of building a chrome extension
wrote in CoffeeScript. While being familiar with the latest is mandatory
to understand
what's going on there, no previous experience with Google Chrome is
needed.

{% end_excerpt %}

Our chrome extension will be a fully fonctional tab switcher that mimics
Command-T feature of Textmate (also known as fuzzy finding).

![](http://media.tumblr.com/tumblr_m4jvww3J2t1qf7p5m.png)

## Why doing it in CoffeeScript ?

[Coffee Script](http://jashkenas.github.com/coffee-script/) is a thin
and elegant syntaxic layer on top of Javascript, allowing
you to write cleaner and concise code and still outputting almost
readable javascript. Why should we avoid a such nice tool to write a
chrome extension ! Plus it's fun to write, it will remind you Ruby and
Python, while still letting you do Javascript wizardry.


For french readers, I gave a talk at a recent
[Paris.rb](http://www.meetup.com/parisrb/) event, you can
read my
[slides](http://www.slideshare.net/jhchabran/introduction-coffeescript-pour-parisrb)
until we get the video online.

## Our goal

Command-T is a battle-tested quick-file-access method that proved to be
efficient. It should be useful to have it available in Chrome,
especially if you
often have more than 20 tabs opened, where they all look like pinned
ones.
Typing a few letter of the URL is clearly faster than hammering like a
monkey the next tab hotkey !

Couldn't we port that great feature in Chrome ? 

## Dissecting an extension

Chrome being a popular browser, it is as expected from a modern browser,
pretty easy to extend.
[Google's starter
guide](http://code.google.com/chrome/extensions/getstarted.html) is a
good resource and gives you a quick intro. 

Skipping implementation details, it's basically the following :

 - A *content script* is executed in the context of the current page,
   having access to the DOM
 - An *extension script* is executed in what you could call chrome
   context, meaning it can manipulate chrome objects like tabs, windows 
 - The *background page* include the *extension script* 
 - These two contexts are *sandboxed*, meaning you can't collide with
   the scripts running on the page
 - Communication between them are made through *message passing* 


## Get confortable 

The absolute minimum is the following structure :


    tabswitcher               # Repository root 
          /background.html    # Extension's 'main view'
          /manifest.json      # Extension settings 


Coffee Script need to be compiled in the first place, automating it
brings two benefits : it's comfortable to develop with, a contributor
can just check out your sources and run your command to build the whole
thing. This lower the entry barrier for contributing to our extension
=).

The simplest way to handle compilation easily is to build a *Cakefile*
(a *Rakefile* or *Makefile* in CoffeeScript).

We'll write it to take \*.coffee input from */src* and output javascript
in  */build* using this command. Our goal is to do the following to
build our extension : 


    $ cake build

But while in development, it's easier to have our files monitored to
reflect changes as we save them. So To watch the *src/* folder and
reflect any
changes made there, there's the *watch* command :

    $ cake build
 

*coffee -h* tells us these commands are directly available :


    $ coffee --output build/ --compile src/


Good. It's time to bake this into a *Cakefile*. Below are the
interesting parts
of it : 


    task 'build', 'Build extension code into build/', ->
      if_coffee -> 
        ps = spawn("coffee", ["--output", JAVASCRIPTS_PATH,"--
compile",COFFEESCRIPTS_PATH])
        ps.stdout.on('data', log)
        ps.stderr.on('data', log)
        ps.on 'exit', (code)->
          if code != 0
            console.log 'failed'


If you've alreay wrote any Rakefile, it's quite similar. If not, we
basically declare the command *build* to be invokable through *cake
build*. We handle if the coffee binary is available or not in the $PATH
and finally execute our coffee command as expected.


## A small overview 

Manipulating the DOM through the standard API bores me to death, so
let's grab [Zepto](http://zeptojs.com/) to do the big work for us. We
could have used JQuery
but we don't need all the browser compatibility stuff, so Zepto with its
minimal features set is a perfect match. Let's store it in */libs*.

Our final structure is the following : 


    tabswitcher               # Repository root 
          /build              # Generated Javascripts end there
          /libs               # Dependencies
          /src                # Our code
          /background.html    # Extension's 'main view'
          /manifest.json      # Extension settings 
          /Cakefile           # Starts build task


Ok, we're now ready to spill some coffee into Chrome :


    $ cake watch


## The extension itself

Our extension is quite simple in its behavior : 

  - listen for keyboard events if  *ctrl-\\* was pressed
  - if pressed, insert some html in the page containing our UI 
  - display opened tabs
  - wait for user input 
  - on enter in the input, go to that tab

So in these steps, those two are calls to *chrome api* : 

  - list all opened tabs, we'll name it  *getTabs*
  - go to a tag, as *switchTab*

Our *content script* that run in the current page, it will send these
two messages to
the *background script*, which is the only one that can make these
calls.

We end with the following process : 

![](http://media.tumblr.com/tumblr_m4jvypXYCB1qf7p5m.png)


The red arrows are message passed from the content script to the
background page ( [message
passing](http://code.google.com/chrome/extensions/messaging.html) ).
It's similar to firing custom events with JQuery and listening for them,
but with a particular API.

## Implementation 

The *content script* is *src/content.coffee* and *background script*
lives in *src/background.coffee*

First things first : a tab. It's simpler than what you may have expected


      tab = 
        id : 43
        windowId : 4
        url: "http://google.com"
        title: "Google"
   

We don't need to handle them directly as the Chrome API will do the job
for us, but it's a starting point.

Let's examine the *content script*, which is where all the work happens. 

An *Application* class encapsulates the main logic. It setups the UI,
binds the
callbacks and pass messages to the *background page*. 


    class Application
      constructor: ->
        # Inject our html into the view
        @injectView()

        # Install a listener for our input 
        @element().find('input').keyup (event)=>
          @onInput(event)

        # Spawn a view that handle results display
        @tabListView = new TabListView @element().find('ul')

      element: ->
        # Return our base div
        @element_ ||= $('#tabswitcher-overlay')

      onInput: (event)->
        # When something is entered is the input, filter tabs !
        candidates = fuzzy(@tabs(), event.target.value)

        # Update tabs that match
        @tabListView.update candidates 

        # If enter
        if event.keyCode == 13
          # Go to that tab
          @switchTab candidates[0].tab iftes?

      hide: ->
        # ...
      show: ->
        # ...

      switchTab: (tab)->  
        # We're switching tab, hide the UI before leaving
        @hide()
    
        # Send message to the background script
        chrome.extension.sendRequest(message:"switchTab", target:tab)

      hotKeyListener: (event)->
        # Listen for ctrl-\
        if event.keyCode
          if event.ctrlKey && event.keyCode == 220 # Ctrl + \
            # Send message to background script, ask for list of tabs
            chrome.extension.sendRequest {message: "getTabs"}, 
              (response)=>
                @tabs_ = response.tabs
                @show()

          else if event.keyCode == 27 # ESC
            @hide()

      injectView: ->
        # Inject our UI in the DOM
        $('body').append ...
    
    app = new Application()

    # Attach our handler
    window.addEventListener("keyup", (e)->
      app.hotKeyListener(e), false)

After defining Application we just instanciate it and bind our
listener, to grab keyboard events. For the sake of readability, I've
skipped the [fuzzy filter
implementation](https://github.com/jhchabran/tabswitcher/blob/master/src/hook.coffee#L4),
which is kind of naive but do
the job as expected. Bold stuff as you can see in the screenshot in the
beginning of the post is handled in another class named *TabView*. 

Let's now see the script running on the *background page* that respond
to calls made from the *content script* :


    # Install the message listener
    chrome.extension.onRequest.addListener (request, sender,
sendResponse)->
      # Select the right response given the message
      switch request.message
        # Grab all tabs
        when "getTabs"
          chrome.windows.getCurrent (window)->
            chrome.tabs.getAllInWindow window.id, (tabs)->
              # We've collected all tabs, let's send them back
              sendResponse(tabs:tabs)
          break
        when "switchTab"
          chrome.tabs.update(request.target.id, selected:true)
          sendResponse({})
          break
        else
          sendResponse({})


Pretty straight-forward, we just take incoming message and handle them.
Only the message 'getTabs' sends back a response : an array of tabs
returned by
Chrome.

## What now ? 

Well, beside some crappy HTML to render tabs, there's nothing left. The
complete code of this extension is available on
[GitHub](http://github.com/jhchabran/tabswitcher) where you can explore
it, fork it as you want ! 

Remember that you need to enable developer's mode in chrome extensions
to install it directly from the sources. 

You can also install the [released
version](https://chrome.google.com/webstore/detail/gkdkligmcadfbagoeggeohelmgalchcn).

Coffee Script is available everywhere you can use javascript, with some
tooling to kick in compilation ! Set up two tasks,
adjust .gitignore and there it works.

Chrome extensions are way simpler to write than I thought ! Next,
understanding how Chrome
handles security and isolation through sandboxing and still sharing DOM
access is
pretty impressive. 

Once you grasped the big picture, it's finally just like building any
web app interactive UI !

 - [Install it directly on your
   Chrome](https://chrome.google.com/webstore/detail/gkdkligmcadfbagoeggeohelmgalchcn).
 - [Source code](http://github.com/jhchabran/tabswitcher)

