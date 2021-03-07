---
date: 2012-12-09
author: J.H. Chabran
layout: post
title: Fun with to_proc and compositions
category: Ruby
tags:
  - Ruby
  - FP
---

What about being able to shorten ```users.collect { |user| user.order.city }``` or its
unefficient form ```users.collect(&:order).collect(&:city)``` into

{% highlight ruby %}
users.collect(&[:order, :city])
{% endhighlight %}

It can be achieved by composing functions, in Ruby's case by composing Procs. 
This is an amusing exercise that demonstrates Ruby's functional abilites.

{% end_excerpt %}

Just in case you need to freshen your memory about composing functions, it's a common notion in functional programming and it's also found early in mathematics courses. 

Given two functions ```f(x)``` and ```g(x)```, ```(g o f)(x) ==
g(f(x))```, ```o``` being the symbol of the composition operation.

## Unchaining method calls

```users.collect { |user| user.order.city }```

The first step here is to compact the ```#order``` and ```#city``` method calls. 

To achieve that, it's interesting to know how methods calls are done
under the hood. Python, by being explicit by design as opposed to Ruby, gives a clear
answer : 

{% highlight python %}
class User 
  def __init__(self, firstname, lastname):
    self.firstname = firstname
    self.lastname  = lastname

  def name(self):
    return self.firstname + self.lastname
{% endhighlight %}

Each method accepts a first argument which is always ```self```.
It's simple as that, a method is nothing more than a function
 whose first argument is the instance. This way, attributes can be
accessed trough self inside the function. Under the hood in Ruby ```@firstname``` is basically just a nice way to grab it from the instance without having to be explicit about ```self```.

Back to our example, with that knowledge we can say that :

{% highlight ruby %}
users.collect { |user| user.order.city }
{% endhighlight %}

is equivalent in the underlying implementation to :

{% highlight ruby %}
# pseudo-code
users.collect { |user| city(order(user)) } 
{% endhighlight %}

So that's it, in theory we got functions here and composing them makes
sense :

{% highlight ruby %}
# pseudo-code, 'o' being the hypothetical composition operator.
get_order_then_city = city o order
users.collect { |user| get_order_then_city(user) }
{% endhighlight %}

Finally, let's convert that to real Ruby code, artificially reverting methods to
their primitive forms, functions. 

{% highlight ruby %}
order = Proc.new { |user| user.order }
city  = Proc.new { |order| order.city }
{% endhighlight %}

Those two Procs still need to be composed, sadly Ruby don't come with a
defined composition operator for Proc, so let's write one.

## Composing functions in Ruby

As Procs are Ruby objects, it's simply a matter of adding a composition
operator to the Proc class. As the symbol used in mathematics, ```o``` can't be used here,
it's usually ```*``` that takes its place.

{% highlight ruby %}
  increment = Proc.new { |x| x + 1 }
  square    = Proc.new { |x| x * x }

  increment_and_square = square * increment 
  
  p increment_and_square(2)
  # => (2+1)^2 = 9
{% endhighlight %}

Implementation is pretty straight-forward :

{% highlight ruby %}
class Proc
  def *(other)
    Proc.new { |x| call(other.call(x)) }
  end
end
{% endhighlight %}

Now ```increment``` and ```square``` can be composed throught the
```*```
operator and it works as expected. 

## Back to business

At this point, the job is almost finished. Procs can be composed,
and symbols can be converted to Procs thanks to ```&:order```.  

```&:order``` is quite common but before composing it, how does it really works ? 

Behind its somewhat exotic syntax, it calls ```#to_proc``` which creates a Proc that sends the
symbol itself, (```:order``` in this case) to an object. Then it
converts the Proc into a block so it can be passed to methods like
```#each``` or ```#collect``` that expects one.

In more concrete terms ```&:order``` creates the following Proc:

{% highlight ruby %}
  get_order = Proc.new { |user| user.order }
{% endhighlight %}

And its generalized form:

{% highlight ruby %}
class Symbol
  def to_proc
    # This is a simplified version, the real one can handle multiple
    # arguments.
    Proc.new { |object| object.__send__(self) }
  end
end

{% endhighlight %}

Such Procs can as previously seen, be easily composed with the brand new ```*```
operator on Procs. 

At this point it can be tempting to write  ```users.collect(&:city * &:order)``` but 
this can't work. As a block isn't an object, calling any method on it (```#*``` in this case) makes absolutely no sense. 
Only a single unary ```&``` can exist in an expression. Ruby will raise a ```SyntaxError``` if 
a second one is present.

The correct syntax with a single ```&``` isn't really shiny, but it
works as expected.

{% highlight ruby %}
users.collect(&(:city.to_proc * :order.to_proc))
# => ['Kuala Lumpur', 'Paris']
{% endhighlight %}

But frankly, from a syntactic point of view, it's sill far from being simpler
than a traditional ```users.collect { |user| user.order.city }``` and
the order feels a bit backward.

## Adding Syntactic Sugar

Even if it's just for fun, better syntax can be achived by calling
Array to the rescue. Having a list of Procs that will be composed makes some sense and provides a lighter syntax.

{% highlight ruby %}
users.collect(&[:city, :order])
# => ['Kuala Lumpur', 'Paris']
{% endhighlight %}

```#to_proc``` can be added to basically any object, while this opens
many weird and exotic possibilites it suits perfectly what is needed
here.

So building a Proc from an array of symbols, given they can be converted
to procs and then composed, can be written as the following: 

{% highlight ruby %}
class array
  def to_proc
    collect(&:to_proc).inject(&:*)
  end
end

users.collect(&[:city, :order])
# => ['kuala lumpur', 'paris']
{% endhighlight %}

Yet without knowing we're composing stuff under the hood, it would be
nice to have the symbols ordered like the chained method calls.

{% highlight ruby %}
class array
  def to_proc
    reverse.collect(&:to_proc).inject(&:*)
  end
end

users.collect(&[:order, :city])
# => ['kuala lumpur', 'paris']
{% endhighlight %}

And it does the job and with a nice syntax! 

The only bad thing here is it has to create a Proc for each symbol and that's why nobody should use it in real code. A less fun but more practical version can be written by using
```#inject``` and ```#send```:

{% highlight ruby %}
class Array
  def to_proc
    Proc.new do |object|
      inject(object) do |this, method_id|
        this.send(method_id)
      end
    end
  end
end
{% endhighlight %}

