---
layout: post
title: Mixed links of the week (2)
category: Links
tags:
  - Links
  - Ruby
  - Rails
  - FP
  - OSX
---

It's been eleven days since my last [mixed links of the week](http://jhchabran.com/blog/2012/12/03/mixed-links-of-the-week-1).

So far I managed to build up enough motivation to write at least one article
per week, thanks to [this great book](http://www.amazon.com/gp/product/1934356883/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1934356883&linkCode=as2&tag=jhchabran-20"), I still have trouble posting these mixed links on a fixed day :).

Anyway, this week includes Ruby, Haskell, R, an interview,
communications and a surprising initiative!

French readers, don't miss [Dimelo Ruby Christmas Contest](http://contest.dimelo.com/) and win a Nexus 7 by submitting Pull Requests to [open source projects](http://contest.dimelo.com/#packaging).

{% end_excerpt %}

During these eleven days I stumbled upon many interesting articles,
starting with [Pat Shaughnessy](http://patshaughnessy.net/) which
crafted [a neat codewalk into Ruby MRI source
code](http://www.rubyinside.com/ruby-mri-code-walk-tour-6020.html). If
you never dived into Ruby source code before and had thoughts like "Where the fuck
do I start" (as everyone did at some point), this video is a must-see.

[Zach Holman](http://zachholman.com/), a notorious Githubber, posted a really well written article explaining how [chat trumps meetings](http://zachholman.com/posts/chat/). Text based discussions are really a better way to communicate according to Zach. And I'm convinced he's right, I'll just add that it's true as long as you work with people with that actually are used to write. Sadly it's a skill that is often underlooked among developers and almost never introduced in programming courses.

Broaden your mind with Haskell with [a Ruby to Haskell](http://bendyworks.com/geekville/articles/2012/12/from-ruby-to-haskell-part-1-testing)
 post which is the first of of the series, beginning with testing. It introduces at some point [QuickCheck](http://hackage.haskell.org/package/QuickCheck) which is basically a fuzzy testing library that mess with functions to ensure constraints are correctly met. Trust me, have a look at this thing, it's very weird for a Rubyist!

CodeSchool published a [course abour R programming language](http://tryr.codeschool.com/), a language designed to deal with
statistics and data modeling. Maybe you remember Zed Shaw using R, in his "Play by Play" Peepcode episode. He showed how he used it to make statistics about his efficiency at different times of the day. Seriously, I wish I had such wonderful content to learn programming when I was a kid. 

[Jim Weirich](http://www.confreaks.com/presenters/24-jim-weirich), mostly known for his many public talks and being the author of Rake, [was interviewd by RubySource](http://rubysource.com/an-interview-with-jim-weirich/). He addresses many topics such as how he got hooked into Ruby, functional programming, threading, testing.

Caching partials with Rails and memcache is still too slow? Have a look
at how the guy behind Obama's campaign website used ```read_multi``` to avoid
fetching sequentially from Memcache. It's smart, simple and comes with a
gem ! [Faster partial rendering and caching, the Obama way](http://ninjasandrobots.com/rails-faster-partial-rendering-and-caching/)

Thought the Haskell link was exotic ? Here comes the Darling project, aiming
to [run OSX binaries on Linux](http://www.phoronix.com/scan.php?page=news_item&px=MTI0Njc).
Still at its very beginning, but hey, Wine got Windows binaries running
on Linux, why couldn't OSX binaries be ran too? Sincerely, I got a huge admiration for people starting such tremendous projects. 

