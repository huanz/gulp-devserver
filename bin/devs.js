#!/usr/bin/env node

var fs = require('vinyl-fs');
var program = require('commander');

var server = require('../index');

program
	.version(require('../package.json').version)
	.option('-c, --config', 'The option config file path')
	.option('-n, --no-browser', 'Do not open in a Browser')
	.option('-l, --log [type]', 'Log level (default: info)', 'info')
	.option('-p, --port <n>', 'The port to run on', parseInt)
	.option('-h, --host', 'The host to run')
	.parse(process.argv);

var opts = {};

if (program.log){
	opts.log = program.log;
}
if (program.noBrowser){
	opts.open = false;
}
if (program.port){
	opts.port = program.port;
}

fs.src('.').pipe(server(opts));