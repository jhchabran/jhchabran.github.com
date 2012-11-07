---
layout: post
title: Vim isn't about speed
---

{{ page.title }}
================

Vim users, myself included, often advocate about gaining speed, carving
text like a
ninja and banning that awful device named a mouse.

The follow-up to this is people saying, "Vim seems to be awesome but I
don't need to
be that fast anyway."

Each time I heard that, I tried to advocate about the fact that as a
coder
you're staying around seven hours per day typing, so why not try
something really efficient ? 

It hardly convinced anyone with that.

Sublime Text 2, Textmate, are common answers, gladly followed by a "It
does the job".

This made realize how wrong I was to introduce vim that way. Sure,
Vim-fu is always amazing to watch, but nobody really cares about speed.

You don't get to code that fast with vim. You spend time thinking then
you enter your idea. Or you think while typing, going back and forth
through potentials solutions. Getting faster don't mean producing
significantly more code, the bottleneck is your brain anyway.


## It's about comfort.

Ever played to a FPS or a RTS ? Think about how you interact with the
game.
You basically remember that each key is associated to a function. Want
to reload ? Press R. Want to build a bunker in Starcraft 2 ? Select your
worker
, press B then U. After a while, it becomes completely natural and you
start memorizing patterns, or simply words made of your keypresses.

Now imagine having to press control R to reload, hold control while
pressing B and U. It would be annoying right ? Having to strech fingers
to
catch that modifier all the time...

Well that's basically the most common way to send commands to your text
editor besides clicking in a menu.


## Modality saves the day

Vim solves that by providing two modes : insert mode and normal mode.
You already know insert mode, it's the behavior you always knew to enter
text. Press hello, it writes "hello". 

Press ESC or Ctrl-C to get back to normal mode, which is the standard
mode and the reason behind the i you have to type before entering text.

Normal mode is similar to Starcraft 2. How can we change the text
insides the quotes in the following example ?

    9 : def greet
    10:   "Hello you!"
    11: end

10G to go to line 10, ci" to delete text inside the pair of quotes and
it puts you in insert mode. That's the kind of moves you make all day
long in vim. And exaclty like in Starcraft 2, it makes words : c stands
for change, i for inner and finally " to point out quotes as a
delimiter.

    9 : def greet
    10:   ""      # The cursor will end between the quotes.
    11: end

Sounds complicated ? Yes at first. But like Starcraft, you'll get used
to these kinds of moves.


Obviously, there are some vim actions bound to control something, like
redo
which is ctrl-r or ctrl-d to scroll down. 
But that still makes significantly less modifiers usage than any other
editor. 


## How could I live without it ?

After a while, it becomes natural, you don't even think about it.
Your brain just know that going to next
tab is gt, change text inside a pair of parenthesis is ci) and so on. It
feels natural, exactly like typing. 

You type to enter text, you type to shape your code, you type to move
around (forget the arrows keys, do yourself a favor, disable them and 
use hjkl instead and learn other moving keys!).

And most of the time, your hands are on or close of the home row, which
is
the key to have comfortable text entering position (This is especially
important if you have small hands like I do !). 

Welcome to Vim, an efficient tool to edit text. It's different from
other
editors, it is tough to learn, but you'll end with what I consider after
trying every editor out there the most comfortable tool to handle text
and code.

This comfort is a plague, you'll want it everywhere : mails,
browser, shell. And this is why people stick to Vim once they got
hooked, comfort.

## Common pitfalls

If you're not from UK or USA, you have a localized keyboard. Throw it
away, it will just stand between you in and vim. For example Azerty is
pretty horrible, : and w are on the bottom row on the keyboard's edge.
Just use a qwerty mapping for coding and you will notice that in fact,
everything was made for qwerty. Weird key positions will now make sense.
Typing 45G to go to line 45 is way easier too since you now got numbers
without shift. Same goes for d3w, delete three words. You got the idea.

Don't try to rebind everything. Choices had been made by people that
spent years in Vi, it's not like you're going to find something better
for every function in your two days vim life span.

If you try switching, stick to it. Try it for a week, not five minutes
until you switch back because you that it wrecks your productivity.
You can't cheat on this step. 


## Conclusion 

I just love vim for the ease it gives me with text editing, but to get
started you have to keep in mind that getting out of your comfort zone
is required to gain more of it. 

In the end, I find that being fast while editing code in Vim is simply a
consequence of this comfort. 

Dig into [Learnivore](http://www.learnivore.com/search/vim) to find many
resources to get started !

 * __Edit :__ correct a few typos
 * __Edit2:__ Thanks to
   [Qoc_au_vin](http://www.reddit.com/user/Qoc_au_vin) for pointing me
that w to advance to the next word isn't required before ci" !
