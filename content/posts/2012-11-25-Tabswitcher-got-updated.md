---
date: 2012-11-25
author: J.H. Chabran
layout: post
title: TabSwitcher got updated
category: Chrome
tags:
  - CoffeScript
  - Chrome
  - Javascript
  - Project
---

TabSwitcher had been started one year ago, to showcase [(see previous
post)](http://jhchabran.com/blog/2011/12/17/build-a-chrome-extension-with-coffeescript)
how a Chrome Extension using CoffeeScript can be built. I recently spend some
time polishing it to bring it to the level of a decently featured
extension. 

Before describing the changes, what problem does it aims to solve ?

{% end_excerpt %}

## Switching between tabs like ninja

I mostly work with more than thirty tabs opened in my browser. Between
 Gmail, Basecamp, Github, various documentations,
news and dumb cat pictures, it ends being pretty scary.

With so many tabs, you can't even read the tabs titles, it's at best a row of
favicons. So when I was toying around Chrome
extensions with CoffeeScript, I attempted to solved that by porting a popular method used to
switch between opened files in code editors: fuzzy finding (match "*google*"
with "*ggle*")

CtrlP.vim, Command-T in Textmate are well known examples of fuzzy
finding.

[Meet TabSwitcher](https://chrome.google.com/webstore/detail/tabswitcher/gkdkligmcadfbagoeggeohelmgalchcn), basically the same thing for Chrome, using urls (over
page titles, they tend to vary too much over time).

## New algorithm

The previous algorithm was written during a flight between New York and
Paris where I couldn't sleep. It was crappy and inefficient. It wasn't even capable of looking
for every substrings in urls, meaning when you submitted "**ruby**", it would
match against "http://**r**o**ub**a**y**.com/" over
"http://reddit.com/r/**ruby**" because the occurrences appeared earlier
in the first url, which is absolutely not the correct result.

This yielded some very weird results and forbid any real usage of the
extension. 

After reading interesting things in the fuzzy finding
field, I wrote a decent yet simple algorithm that can handle real usage. 

First, I added tests, which you may want [to have a look
at](https://github.com/jhchabran/tabswitcher/blob/master/spec/fuzzy_spec.coffee), they
basically explains how the ranking algorithm scores urls depending on how input characters are distributed in each url.

## Configurable

Another key point was that the old extension wasn't even configurable at all. This
now can be done through the extension button. Yet I have to do something
with the possible hotkeys because if you set by mistake a Chrome shortcut, let's say Ctrl-T, Chrome will ignore the extension and fire its default behavior instead.

This become irritating when you know that chrome have dozens of shortcuts
that can interfere.

I have to thing about how I'll handle that. I hope the bindings are
accessible from the APIs, because manually maintaining a list of every possible
shortcuts for OSX, Window and Linux is going to be painful and easily
broken.

## Reworked design

Still far from being perfect, but it's more Chrome'ish now.
Urls are now truncated and won't mess the layout.

![](https://lh4.googleusercontent.com/4BLX3uvEudzeJjhcCga9mSJEYwmfVnZKFhP055JyitaCNj4XldpFTKLnoh3G1pPKOCMC0BVqug=s640-h400-e365)

## Dramatic Chrome Store

So far I don't really have a clue on how people behave on the chrome store, I got like 4000 views on the past two days and got eight installs. 

![](/img/dramatic_chrome_store.png)

Obviously, there's still a lot of time to be spent on how to market the extension itself, helping people to understand what it does and narrowing down the description to hit the right potential users before they hit the back button.

This is going to be fun and entertaining to play with, I'd probably write
about it!
