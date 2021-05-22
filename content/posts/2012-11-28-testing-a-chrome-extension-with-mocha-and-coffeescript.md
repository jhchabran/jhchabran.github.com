---
date: 2012-11-28
author: J.H. Chabran
layout: post
title: Testing a Chrome Extension with Mocha and CoffeeScript
tags:
  - code
---

So we've previously seen how to bootstrap [a chrome extension with CoffeeScript](http://jhchabran.com/blog/2011/12/17/build-a-chrome-extension-with-coffeescript/).
The next step is about adding testing support. Even if it's a simple
extension, the whole process of reloading the extension in the browser
to manually test a feature is incredibly boring and error prone.

{% end_excerpt %}

To illustrate,
[TabSwitcher](https://chrome.google.com/webstore/detail/tabswitcher/gkdkligmcadfbagoeggeohelmgalchcn) will be used as an example, more
specifically the `match(url, abbreviation)` function which returns a `float`, indicating how close is
`abbreviation` is to `url`.

This post assume you're already comfortable with testing.

## Setuping the tests

Before anything, a test framework needs to be chosen. Mocha is probably
the most popular choice nowadays. It doesn't come with an expectation
library and defaults to NodeJS's standard library :
[assert](http://nodejs.org/api/assert.html).

As you may know javascript Arrays being objects, testing equality between objects of the same type
means testing identity. In short `[1,2] == [1,2]` evaluates to `false`.
It does make sense given how the equality operator is defined yet being
unusual to someone used to Ruby or Python.

Most of the time, it's equality between elements that is needed when
writing assertions.

A bad practice to achieve it would be to use `toString()`, converting them and
running the comparison against the returned strings. It's poor man's
equality because it would skip elements types, ie comparing `[1,2]`
and `['1','2']` returns `true` instead of the expected `false`.

Node's assert library is obviously relying on the equality operator, it
would yield false positives which are really painful to deal with.

To avoid wasting time plumbing with arrays comparisons, let's just use
an assertion library, Mocha advertises about should.js which provides
our expected array comparison:

{% highlight coffeescript %}
it "should success", ->
[1,2].should.eql([1,2])
{% endhighlight %}

To install these two libraries:

{% highlight sh %}
npm install mocha should -g
{% endhighlight %}

Storing tests under `/tests` directory is a no brainer. You can place
that directory wherever you want, `/spec` being a common choice
too.

{% highlight sh %}
cd tabswitcher # extension's root dir
mkdir tests
{% endhighlight %}

And create a file that will contain our tests.
{% highlight sh %}
touch spec/fuzzy_test.coffee
{% endhighlight %}

{% highlight coffeescript %}
require 'should'

describe "Fuzzy", ->
it "should fail", ->
0.should.eql(42)
{% endhighlight %}

Run it with
{% highlight sh %}
mocha --compilers coffee:coffee-script tests

.

X 1 of 1 test failed:

1.  Fuzzy should fail:
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
    at process.startup.processNextTick.process.\_tickCallback
    (node.js:244:9)
    {% endhighlight %}

A [test
task](https://github.com/jhchabran/tabswitcher/blob/master/Cakefile#L46) in the Cakefile comes handy to fire the tests.

## Loading the code we want to test

Now tests are up and failing, it's time to write expectations about
functions that will be used in the extension. There is a last bump on
our road to deal with. Code is ran in two different environments :
browser and NodeJs.

On one hand, the chrome extension code runs in a browser, scripts are loaded by the html
pages, through `script` tags. On the other hand tests
run the code in a Node.js environment and loading is done through
`require` and `exports` object.

Given `src/fuzzy.coffee` is going to define a `match` function
we need to use in our tests, it first must be exported to be succesfully required
afterward.

{% highlight coffeescript %}

# /src/fuzzy.coffee

match = (url, abbreviation)->

# ...

exports.match = match  
{% endhighlight %}

{% highlight coffeescript %}

# /tests/fuzzy_spec.coffee

f = require '../src/fuzzy'

describe "Fuzzy", ->
it "should call match". ->
score = f.match "http://google.com", "ggl"
score.should.eql(3)
{% endhighlight %}

We run it again with `cake test` and it should fail or success
depending the implementation of `match`.

But if the extension is launched within the browser it will whine about
`exports` not being defined. No surprise, in a browser
context,`exports` doesn't mean anything unless manually defined.

{% highlight coffeescript %}

# Idiomatic predicate

isCommonJS = typeof(window) == "undefined"

if isCommonJS
exports.match = match
else
window.match = match
{% endhighlight %}

And now we got our code both running in specs and in the extension.

## What about Chrome API ?

Extension code that makes use of chrome.\* apis that can't be used in tests as is because they belong to Chrome and we're running tests unde NodeJs.

Usually simply separating concerns solves the problem. In the
present case, `match` just returns a float, indicating how close the
abbreviation is to the url. No api calls are made through computation,
leaving no need to mock them in some sort.

Sometimes, for simplicity sake, it's shorter to still pass around chrome
api structures, like `chrome.tab`. Well, it's just an object, build
one that mimics the fields you need and that's all.

{% highlight coffeescript %}

# /tests/fuzzy_spec.coffee

# ...

tab =
url : "http://google.com"
title : "Google"

# ...

{% endhighlight %}

## It's coding time!

We got our extension running CoffeeScript code and tests can be written as
needed. Isn't it more comfortable to write a Chrome Extension now ?

As we just added unit testing so far, an interesting question would be how to write some integration tests ? Like testing the whole workflow, considering we must deal with code running in different contexts: background page, popup and inserted in the current page.

You can find the [example used through this post on Github](http://github.com/jhchabran/TabSwitcher).
