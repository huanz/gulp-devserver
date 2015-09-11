'use strict';
var os = require('os');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var socket = require('socket.io');
var watch = require('node-watch');
var connect = require('connect');
var inject = require('connect-inject');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');
var through = require('through2');

var utils = require('./utils');
var iProxy = require('./iproxy');

var openURL = function(url) {
    switch (process.platform) {
        case 'darwin':
            exec('open ' + url);
            break;
        case 'win32':
            exec('start ' + url);
            break;
        default:
            spawn('xdg-open', [url]);
    }
};

var getIPAddress = function() {
    var ifaces = os.networkInterfaces();
    var ip = '';
    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details) {
            if (ip === '' && details.family === 'IPv4' && !details.internal) {
                ip = details.address;
                return;
            }
        });
    }
    return ip || '127.0.0.1';
};

var BROWSER_SCIPTS_DIR = path.join(__dirname, 'lib');
var defaults = {
    host: '',
    port: 3000,
    defaultFile: 'index.html',
    https: false,
    open: true,
    log: 'info',
    livereload: {
        enable: true,
        port: 35729,
        filter: function(filename, cb) {
            cb(!(/node_modules/.test(filename)));
        },
        clientConsole: true,
    },
    listdir: true,
    proxy: {
        enable: true,
        host: 'https://cnodejs.org',
        urls: /^\/api\//,
        mock: {
            '/api/': {

            }
        }
    }
};

module.exports = function(options) {
    var config = utils.extend({}, defaults, options);
    config.host = config.host || getIPAddress();
    // 自动打开浏览器
    var openInBrowser = function() {
        if (!config.open) {
            return;
        }
        openURL('http' + (config.https ? 's' : '') + '://' + config.host + ':' + config.port);
        openInBrowser = null;
    };

    var app = connect();
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    // http server
    var webserver = null;
    if (config.https) {
        var options = {
            key: fs.readFileSync(config.https.key || __dirname + '/certs/server.key'),
            cert: fs.readFileSync(config.https.cert || __dirname + '/certs/server.cert')
        };
        webserver = https.createServer(options, app);
    } else {
        webserver = http.createServer(app);
    }

    // livereload服务相关
    if (config.livereload.enable) {
        // 插入livereload相关script至body
        var ioServerOrigin = 'http://' + config.host + ':' + config.livereload.port;
        var snippet = '';
        if (config.livereload.clientConsole) {
            snippet += fs.readFileSync(BROWSER_SCIPTS_DIR + '/console.js');
        }
        snippet += '<script async defer src="' + ioServerOrigin + '/livereload.js"></script>';
        app.use(inject({
            snippet: snippet,
            rules: [{
                match: /<\/body>/,
                fn: function(w, s) {
                    return s + w;
                }
            }]
        }));
        // 创建script服务器
        var ioApp = connect();
        ioApp.use(serveStatic(BROWSER_SCIPTS_DIR, {
            index: false
        }));
        var ioServer = config.livereload.ioServer = http.createServer(ioApp).listen(config.livereload.port, config.host);
        // 启动socket服务
        var io = config.livereload.io = socket(ioServer);
        io.on('connection', function(socket) {
            utils.log('Livereload client connected');
            socket.on('console_log', function(args) {
                args.unshift(utils.colors.green('log'));
                utils.log.apply(null, args);
            });
            socket.on('console_warn', function(args) {
                args.unshift(utils.colors.yellow('warn'));
                utils.log.apply(null, args);
            });
            socket.on('console_info', function(args) {
                args.unshift(utils.colors.cyan('info'));
                utils.log.apply(null, args);
            });
            socket.on('console_error', function(args) {
                args.unshift(utils.colors.red('err'));
                utils.log.apply(null, args);
            });
        });
    }

    // gulp入口
    return through.obj(function(file, enc, callback) {
        config.path = file.path;
        if ('debug' === config.log) {
            app.use(function(req, res, next) {
                utils.log(req.method + ' ' + req.url);
                next();
            });
        }
        // 代理
        if (config.proxy.enable) {
            app.use(iProxy(config.proxy));
        }

        // 静态文件服务器
        app.use(serveStatic(config.path, {
            index: (config.listdir ? false : config.defaultFile)
        }));

        // 列出目录文件列表
        if (config.listdir) {
            app.use(serveIndex(path.resolve(config.path), {
                icons: true
            }));
        }

        // 监听文件变化，reload
        if (config.livereload.enable) {
            watch(config.path, function(filename) {
                config.livereload.filter(filename, function(shouldReload) {
                    if (shouldReload) {
                        utils.log('changed: ' + utils.colors.yellow(path.relative(config.path, filename)));
                        config.livereload.io.sockets.emit('reload');
                        config.livereload.io.sockets.emit('file_changed', {
                            path: filename,
                            name: path.basename(filename),
                            ext: path.extname(filename),
                        });
                    }
                });
            });
        }

        this.push(file);

        callback();
    }).on('data', function() {
        // start the web server
        webserver.listen(config.port, config.host, openInBrowser);
        utils.log('Webserver started at', utils.colors.cyan('http' + (config.https ? 's' : '') + '://' + config.host + ':' + config.port));
    }).on('kill', function() {
        webserver.close();
        if (config.livereload.enable) {
            config.livereload.ioServer.close();
        }
    });
};
