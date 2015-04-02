# localtunnel-runner
Run any shell command with access a public local SSH tunnel,
courtesy of [localtunnel].

## What's a "local tunnel"?
A local tunnel *temporarily* exposes your computer to the
outside world through a single port. You can use a tunnel to
share your work with far-flung colleagues or friends on
another network. For more info, check out
[localtunnel.me](https://localtunnel.me).

## Why would I need this?
At [18F] we needed a reliable way to make our development
environments visible to the outside world so that we can run
cross-browser tests against live web applications. This tool
allows us to expose web applications running on our own
computers to services such as [Sauce Labs] and [BrowserStack],
which can run [Selenium] tests against them on multiple browsers.
See [below](#examples) for some examples.

## Installation
Grab [npm] if you don't have it, then run:

```sh
npm install -g localtunnel-runner
```

## Usage
This package provides a single command-line tool, `lt-run`:

```
lt-run [options] [--] <test command>

All instances of the literal string `<url>` in your test command will
be replaced with the tunnel URL. For instance:

lt-run --port 8080 -- npm test -- --url="<url>"

lt-run --port 8000 -- nosetests --url="<url>"

The child process can also access the tunnel URL via the
$LOCAL_TUNNEL_URL environment variable.

Options:
  --port, -p     The local port you wish to expose on localtunnel.me
                                                           [default: 80]
  --local-host   The host you wish to expose      [default: "127.0.0.1"]
  --dry-run, -d  Just print the command to be run, for debugging
                 purposes                                               
```

## How does it work?
`lt-run` is language-agnostic; you tell it which port to expose on [localtunnel]
and give it a command to run, then it:

1. launches a local SSH tunnel so your web app is visible at a
   randomly-generated URL in the form `https://xxxyyyzzz.localtunnel.me`;
2. replaces any instance of `<url>` in the command arguments with the
   local tunnel URL; and
3. executes the command and provides the URL in the `LOCAL_TUNNEL_URL`
   environment variable.

## <a name="examples"></a> Examples

###### Node
```
lt-run --port 1337 -- \
  npm test -- --port 1337 --url "<url>"
```

###### Django + Selenium
```sh
lt-run --port 8081 -- \
  ./manage.py test selenium_tests --liveserver=localhost:8081
```

[localtunnel]: https://localtunnel.me
[npm]: https://npmjs.com
[18F]: https://18f.gsa.gov
[Selenium]: http://seleniumhq.com
[Sauce Labs]: https://saucelabs.com/
[BrowserStack]: https://www.browserstack.com/
