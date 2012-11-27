---
layout: post
title: Setuping tests for a Chrome Extension with CoffeeScript
category: Chrome
tags:
  - CoffeeScript
  - Chrome
  - OpenSource
---

So we've previously seen how to bootstrap a chrome extension with CoffeeScript.
The next step is about adding testing support. Even if it's a simple
extension, the whole process of reloading the extension in the browser
to manually test a feature is plain boring and error prone.

To illustrate this, TabSwitcher will be used as an example, covering
basic tasks like setuping the test environment to load the code that
requires testing.

This post assume you're already comfortable with testing, if you're not
you will find resources on TODO.

## Setuping the tests

Before anything, a test framework need to be chosen. Mocha is probably
the most popular choice nowadays. Mocha doesn't come with an expectation
library and relies by default on NodeJS's standard library : assert.

That would be enough if javascript did not come with exotic behaviors,
like ```[1,2] == [1,2]``` evaluating to ```false```. And the assert
standard library relying on the equality operator, this means test would
require plumbing to work with arrays and tests in TabSwitcher are
heavily relying on array comparison. Anyway, using should.js, the first
advertised expectation library on Mocha website just solve
the problem. 

{% highlight shell %}
npm install mocha should -g
{% endhighlight %}

Tests will live under the tests directory :
{% highlight shell %}
cd tabswitcher # extension's root dir
mkdir tests
{% endhighlight %}

And create a file that will contain our tests.
{% highlight shell %}
touch spec/fuzzy_test.coffee
{% endhighlight %}

{% highlight coffeescript 
require 'should'

describe "Fuzzy", -> 
  it "should fail", ->
    0.should.eql(42)
{% endhighlight %}

Run it with 
{% highlight shell %}
mocha --compilers coffee:coffee-script tests 

  ․

  ✖ 1 of 1 test failed:

  1) Fuzzy should fail:
      
      actual expected
      
      42 0
      
      at Object.Assertion.eql
(/home/tech/code/jhchabran/tabswitcher/node_modules/should/lib/should.js:285:10)
      at Context.<anonymous>
(/home/tech/code/jhchabran/tabswitcher/tests/fuzzy_test.coffee:8:24)
      at Test.Runnable.run
(/usr/local/lib/node_modules/mocha/lib/runnable.js:213:32)
      at Runner.runTest
(/usr/local/lib/node_modules/mocha/lib/runner.js:341:10)
      at Runner.runTests.next
(/usr/local/lib/node_modules/mocha/lib/runner.js:387:12)
      at next (/usr/local/lib/node_modules/mocha/lib/runner.js:267:14)
      at Runner.hooks
(/usr/local/lib/node_modules/mocha/lib/runner.js:276:7)
      at next (/usr/local/lib/node_modules/mocha/lib/runner.js:224:23)
      at Runner.hook
(/usr/local/lib/node_modules/mocha/lib/runner.js:244:5)
      at process.startup.processNextTick.process._tickCallback
(node.js:244:9)
{% endhighlight %}

Shortening the command to fire tets can't harm, let's add that to the
[Cakefile]().
Our test fails as expected, we can now write some expectactions.

## Loading the code we want to test 

Before testing anything we need to load the code that requires testing.

On one hand, the chrome extension code runs in a browser, scripts are loaded by the html
pages, through ```script``` tags. On the other hand the jasmine-node binary we installed
runs the code in a Node.js environment environment. Code loading is
achieved through the ```require``` function. Defining which objects or
functions a node module exports is done through the exports object. 

Given ```src/fuzzy.coffee``` defines two public functions, ```match```
and ```sortByMatchingScore``` :

{% highlight coffeescript %}
exports.match = match  
exports.sortByMatchingScore = sortByMatchingScore
{% endhighlight %}

This code will export these two function, making them available to our
tests, as shown below in ```spec/fuzzy_spec.coffee```:

{% highlight coffeescript %}
f = require '../src/fuzzy'

describe "Fuzzy", -> 
  it "should call match". ->
    f.match "http://google.com", "ggl"
{% endhighlight %}

We run it again and we got it all green.

{% highlight shell %}
f = require '../src/fuzzy'

describe "Fuzzy", -> 
  it "should call match". ->
    f.match "http://google.com", "ggl"
{% endhighlight %}

But that won't work in the extension because ```exports``` isn't
defined. To solve that, assigning ```window``` to ```exports`` will do
the trick.

And now we got our code both running in specs and in the extension.


## Isolating the code that need to be tested.

Extensions makes usage of chrome.\* apis. Since we can't use them from
our tests we go around them by design or mock them. For now let's just
keep things simple, the later will be described in another post.

Most of the time we can avoid embedding calls to the chrome api by
simply separating concerns. In the case of Tabswitcher, the fuzzy
algorithm's only responsability is to discrimate and sort urls with a short
string.

The two key functions prototypes are : 

{% highlight coffeescript %}
# Given an array of urls and an abbreviation
# Returns an array of matching informations, sorted by their scores.
sortByMatchingScore = (urls, abbrev)->  
  # ...

# Given a string and an abbreviation
# Returns a hash of matching informations, 
# with 'score' is an float between 0 and abbrev.length varying upon how
#              much abbrev match string
#      'indexes' is an array with the the positions of the chars in the string
match = (string, abbrev, offset)->
  # ...
{% endhighlight %}

Ok, no mocking needed !




