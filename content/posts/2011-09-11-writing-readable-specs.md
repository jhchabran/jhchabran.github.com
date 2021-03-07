---
layout: post
author: J.H. Chabran
date: 2011-09-11
title: Writing readable specs
category: Ruby
tags:
  - Ruby
  - Testing
  - RSpec
---
Writing Rails specs with [RSpec](https://www.relishapp.com/rspec) and 
[FactoryGirl](https://github.com/thoughtbot/factory_girl) is easy to do
when you
got a basic understanding of testing principles but you may have noticed
how these specs tends to get cluttered over time. Even to the point you
don't get what's going on at all and call your co-worker who wrote them
and ask him to handle your task! 

The following points are basic principles to keep in mind while writing
specs to avoid being stuck with an unreadable spec.

{% end_excerpt %}

We deal with four models : User, Cart, Order and Item.
Their relationships are obviously as simplified as possible to keep
ourselves focused on their tests.

    class User
      has_one :cart 
      has_many :orders
    end

    class Cart
      belongs_to :user
      has_many :items
    end

    class Order
      has_many :items
      belongs_to :user
    end

    class Item 
      belongs_to :cart
      belongs_to :order
      belongs_to :product
    end


## Don't Repeat Yourself

As usual, the DRY principle. Consider the following code (user_spec.rb)
: 


    describe User do
      before :each do
        @user = Factory.create :user
      end

      it "should order the cart with one item" do
        @cart = Factory.create :cart, :user => @user
        @item = Factory.create :item, :cart => @cart

        @user.order! @cart
        @cart.should be_ordered
      end

      it "should discard the cart" do
        @cart = Factory.create :cart, :user => @user
        @item = Factory.create :item, :cart => @cart

        @user.discard_cart
        @cart.items.should be_empty
      end
    end


Quite clean by itself, we create a user for each test, as expected for a
spec about the user model. Yet you can easily notice we're building
other models
in our two tests. 

We can factorize these factories instanciation to stay DRY : 

    describe User do
      before :each do
        @user    = Factory.create :user
        @cart    = Factory.create :cart, :user => @user
        @item    = Factory.create :item, :cart => @cart
      end

      it "should order the cart with one item" do
        @user.order! @cart
        @cart.should be_ordered
      end

      it "should discard the cart" do
        @user.discard_cart
        @cart.items.should be_empty
      end
    end


Now we got two tests and this example rise the following principle : 

**Test code should be almost a direct translation of its name**

Any context initialization, should be done in a before block to avoid
polluting the test code itself.

## Enhance readability 

As we avoid to pollute code to enhance readability, we can also
emphasize on what's important. It allows the reader to grasp with ease
what's going on. 


    describe User do
      before :each do
        @user    = Factory.create :user
        @cart    = Factory.create :cart, :user => @user
        @item    = Factory.create :item

        @cart.items << @item # focus on adding an item
      end
  
      # ...
    end


The main point of this before block is to craft a cart with an item
within. As factories are cool, it doesn't mean we have to use their
features all the time. 

Using the &lt;&lt; operator on line 7, on the items association 
emphasize on adding our item to the cart instead of diluting it 
through the factories. This line of is the most important
considering we're testing how a user interacts with items.

So while writing your test code, be sure to **avoid embedding your
intentions in the basic plumbing**. 

## One expectation per test please

To pursue in our readability quest, you may have noticed that the
example used in the previous points was really simple. But what makes
theses so simple ? Those two tests got only one expectation at a time.

Consider the following code : 


    describe User do
      before :each do
        @user = Factory.create :user
        @cart = Factory.create :cart, :user => @user
        @item = Factory.create :item, :cart => @cart

        @order = @user.order! @cart
      end

      it "should finalize the order" do
        @order.finalize!
        @user.should have(1).finalized_orders
        @order.should be_finalized
      end
    end


We've got two *should* call there. Even if it's just slightly more
complicated than before, you can separate concerns. We wrote *describe
User* meaning we talk about user here. We do not want to mix
expectations about orders and users.

Accordingly expectation on line 12 , even if being really similar to
line 11 has
nothing to do here. So we can rewrite this test in two separated tests
(order_spec.rb) :


    describe Order do
      before :each do
        @cart  = Factory.create :cart
        @user  = @cart.user
        @cart.items << Factory.create_list :item, 3

        @order = @user.order! @cart 
      end

      it "should finalize the order" do
        @order.finalize
        @order.should be_finalized
      end
    end



    describe User do
      before :each do
        @user = Factory.create :user
        @cart = Factory.create :cart, :user => @user
        @item = Factory.create :item, :cart => @cart

        @order = @user.order! @cart
      end

      it "should finalize the order" do
        @order.finalize!
        @user.should have(1).finalized_orders
      end
    end


Plain simple, just **formulate expectations about your current subject
while writing test
and ignore the rest**. Why ? Because if you don't you're leaving the
coast
of unit tests to head around integration testing land.

## Slice your specs with different contexts 

When it comes to models, there's a lot to handle. Business logic,
mass-assignements, validation sanity.( Remember [*fat models for skinny
controllers*](http://weblog.jamisbuck.org/2006/10/18/skinny-controller-fat-model)
eh ? It's for a reason ! )  

While you can argue if you should test validations and assignments or
not, which is out
of the topic here, we still have to test for a wide range of business
logic cases. 

All of these case can easily be sliced by concerns, for example a user
can be edited and can order items through a cart. An easy way to
name contexts is to use the ing form of the verb describing the action :

    describe User do
      context "editing informations" do
        # ...
      end

      context "ordering items" do
        # ...
      end

      context "canceling cart" do
        # ...
      end
    end


Writing "while editing ..." or "when editing ..." is a matter of taste,
while I personally tend to prefer a concise description. 

And if we add validations and assignments ? (helpers are provided by
[should-matchers](https://github.com/thoughtbot/shoulda-matchers)) 


    describe User do
      describe "validations" do
        it { should validate_presence_of(:email) }
        it { should validate_presence_of(:name) }
      end

      describe "assignments" do
        it { should allow_mass_assignment_of(:email) }
        it { should allow_mass_assignment_of(:name) }

        it { should_not allow_mass_assignment_of(:administrator) }
      end

      context "editing informations" do
        # ...
      end

      context "ordering items" do
        # ...
      end

      context "canceling cart" do
        # ...
      end
    end


That makes a readable skeleton for our tests. 

The point of writing specs is to keep them enjoyable and litteraly act
as documentation for everyone. Those four advices are just basics but at
least ensure you're heading in the right direction with your specs.
