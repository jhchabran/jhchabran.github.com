---
author: J.H. Chabran
title: "An Elixir Plug that targets a specific path"
date: 2018-03-29
draft: false
---

_I originally published this post on [Heetch Engineering](https://medium.com/inside-heetch/an-elixir-plug-that-targets-a-specific-path-f0c17bd232a7) and has been ported here for archiving purposes._

---

&nbsp;

Plug is a cornerstone of Elixir and handling HTTP requests. It’s striking how simple it is to write one:

```elixir
defmodule Example.HelloWorldPlug do
  import Plug.Conn

  def init(options), do: options

  def call(conn, _opts) do
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "Hello World!\n")
  end
end
```

Yet simple does not necessarily mean that it is easy to use, especially when you’re getting started.

For example, if you look at the code above, it’s not obvious how to update it so it only acts on a specific path. That’s precisely what we’ll be looking at here.

## A concrete example

An example of such a feature could be a health check handler. It’s an HTTP route (ex: `/_health_check`) that can be requested to know if a given web application is performing correctly or not.

- A `200` OK status code means that yes, it’s operating properly.
- Anything else would mean that there is a problem and this instance of our application should not receive requests anymore.

This way clients have a way to know if it’s running smoothly or not. For example, container orchestration solutions such as Kubernetes and Mesosphere DC/OS use this mechanism to know if it should kill Docker container running the app or not.

We will be using this use case during the rest of this post.

## Why not just use Plug.Router?

If all we want is to match on a given path and respond with a specific response, Plug.Router sounds like an immediate solution. But what if we need to share the health check code among Phoenix apps and other Plug-based apps ?

A module using `Plug.Router` is a plug itself and thus could be shared. But can’t we just write a bare plug instead for the sake of simplicity?

Let’s see where we start if we’re not using Plug.Router to match specific routes. For a module to be a plug, it needs the `call/2` callback to be implemented.

`call/2` takes two parameters, `conn` which is a `%Plug.Conn{}`, representing our connection to the client and `opts`, a set of options.

Looking at what is inside the `%Plug.Conn{}` struct, we can see that there are many interesting fields:

```elixir
# (straight from https://github.com/elixir-plug/plug/blob/578cd973037bd3e8695817a0c4c69cac9d22db6a/lib/plug/conn.ex#L17-L32)

defmodule Plug.Conn do
  @moduledoc """
  (...)
  ## Request fields
  * (...)
  * `host` - the requested host as a binary, example: `"www.example.com"`
  * `method` - the request method as a binary, example: `"GET"
  * `request_path` - the requested path, example: `/trailing/and//double//slashes/`
  * `path_info` - the path split into segments, example: `["hello", "world"]
  * `query_string` - the request query string as a binary, example: `"foo=bar"`
  * (...)
  (...)
  """
end
```

All these attributes being inside `conn`, we can pattern match against them. `request_path` is a good fit but it may contain trailing slashes. Instead, path_info is a list of each segment in the path, so we don’t have to bother with slashes at all, making it a better choice here.

Let’s see how it goes:

```elixir
defmodule HealthCheck.Plug do
  import Plug.Conn
  @behaviour Plug

  def init(opts), do: opts

  # path_info matches with health check path!
  def call(conn = %{path_info: ["_health_check"]}, _opts) do
    conn
    |> send_resp(200, "ok")
    |> halt()
  end

  # nope, not for us, pass it down the chain.
  def call(conn, _opts), do: conn
end
```

So, in concrete terms, given that the health check path is `/_health_check`:

- If path_infomatches, respond with a `200` status code and halt the plug pipeline so that no other plugs will be called.
- Otherwise, just pass the request down the chain to other plugs, like `plug :match` from `Plug.Router` or `Phoenix.Router`.

## Using our plug with Plug.Router

The `HealthCheck.Plug` can be used like any other plug but, if we want to use it within a `Plug.Router`, where it is inserted can change the outcome. Inserting it after `plug :dispatch` and `plug :match` will lead to the request being caught by the catch-all route before reaching our plug.

So the right way to use it is as follows:

```elixir
defmodule MyApp.Router do
  use Plug.Router

  # This plug must be included **before** `plug :dispatch` and `plug :match`.
  # Otherwise, the reponse will already be sent before it reaches the HealthCheck Plug.
  plug HealthCheck.Plug

  plug :match
  plug :dispatch

  match _ do
    send_resp(conn, 404, "not found")
  end
end
```

## Using our plug with Phoenix

Phoenix works similarly. The plug needs to be inserted before any routing happens. Without diving into details, Phoenix implements its HTTP handler in two components, the endpoint which is a top-level plug and the router, where routes are defined.

So here, it’s required to insert our Plug in the endpoint, before inserting the router (exactly like we’ve seen previously).

```elixir
defmodule MyAppWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :my_app

  # This plug must absolutely be included **before** `plug MyAppWeb.Router`
  plug HealthCheck.Plug
  plug MyAppWeb.Router
en d
```

## Conclusion

All that was done in here was to inspect what’s inside a connand pattern match against it. Very often, pattern matching is itself powerful enough to solve most problems.

In the end and like in other functional languages, looking at what structures are being carried around is really helpful and provides a lot of insight. It should be one of the first things to inspect when exploring code.
