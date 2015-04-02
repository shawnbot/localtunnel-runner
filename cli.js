#!/usr/bin/env node
var yargs = require('yargs')
      .usage([
        '$0 [options] [--] <test command>',
        '\n\n',
        'All instances of the literal string `<url>` in your test command will ',
        'be replaced with the tunnel URL. For instance:',
        '\n\n',
        '$0 --port 8080 -- npm test -- --url="<url>"',
        '\n\n',
        '$0 --port 8000 -- nosetests --url="<url>"',
        '\n\n',
        'The child process can also access the tunnel URL via the $LOCAL_TUNNEL_URL environment variable.'
      ].join(''))
      .describe('port', 'The local port you wish to expose on localtunnel.me')
      .default('port', 80)
      .describe('local-host', 'The host you wish to expose')
      .default('local-host', '127.0.0.1')
      .describe('dry-run', 'Just print the command to be run, for debugging purposes')
      .boolean('dry-run')
      .alias('dry-run', 'd')
      .alias('port', 'p')
      .alias('h', 'help')
      .wrap(72),
    options = yargs.argv,
    args = options._;

if (!args.length) {
  return yargs.showHelp();
}

var localtunnel = require('localtunnel'),
    spawn = require('child_process').spawn;

var opt = {
  host: 'http://localtunnel.me',      // TODO: expose as option
  local_host: options['local-host'],
  subdomain: null,                    // TODO: expose as option
};

localtunnel(options.port, opt, function(error, tunnel) {
  if (error) return console.error('error:', error);

  var done = false;
  tunnel.on('close', function() {
    if (!done) {
      console.warn('tunnel closed!');
      process.exit(1);
    }
  });

  var url = tunnel.url;
  console.warn('tunnel URL:', url);
  args = args.map(function replaceUrl(arg) {
    return arg.replace(/<url>/g, url);
  });

  console.warn('running:', args.join(' '));
  if (options['dry-run']) {
    console.warn('(exiting)');
    return process.exit(0);
  }

  var env = Object.create(process.env);
  env.LOCAL_TUNNEL_URL = url;

  var child = spawn(args.shift(), args, {
    env: env
  });

  process.stdin.pipe(child.stdin);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', function(code) {
    console.warn('child process exited with code', code);
    done = true;
    tunnel.close();
    return process.exit(code);
  });
});
