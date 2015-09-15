# gulp-devserver [![stars](https://img.shields.io/github/stars/huanz/gulp-devserver.svg?style=flat-square)](https://github.com/huanz/gulp-devserver/stargazers) [![npm package](https://img.shields.io/npm/v/gulp-devserver.svg?style=flat-square)](https://www.npmjs.com/package/gulp-devserver)

[![npm](https://nodei.co/npm/gulp-devserver.png)](https://www.npmjs.com/package/gulp-devserver)

一个本地调试`gulp`插件，具备如下功能：

* 随时随地启动一个静态文件服务器
* 监听文件变化，自动重新加载
* 代理接口，让ajax跨域不再是个事儿
* 假数据数据生成，轻松调试
* console劫持，轻量级远程调试助手

# Installation

作为`gulp`插件使用：

	$ npm install --save-dev gulp-devserver

单独使用：

	$ npm install gulp-devserver -g

# Usage

作为`gulp`插件使用：

	var gulp = require('gulp');
	var server = require('gulp-devserver');

	gulp.task('devserver', function () {
	  gulp.src('./app')
	    .pipe(server({
	      livereload: {
	      	clientConsole: true
	      },
	      proxy: {
	      	enable: true,
	      	host: 'http://w3cboy.com',
	      	urls: /^\/api\//
	      }
	     }));
	});

单独使用：

	$ devs --help

		Usage: devs [options]

		Options:

			-h, --help        output usage information
    		-V, --version     output the version number
    		-c, --config      The option config.js file path
    		-d, --dir         The option static files dir
   			-n, --no-browser  do not open the localhost server in a browser
    		-l, --log [type]  log level (default: info)
    		-p, --port <n>    the port to run on
    		
下面是一个`config.js`配置文件模板：

	module.exports = {
		livereload: {
			clientConsole: true
		},
		proxy: {
        	enable: true,
        	host: 'http://w3cboy.com',
        	urls: '/api/list'
    	}
	};

# Options

**host**

静态服务器host，默认空会获取本地ip作为host。`default`: `''`

**port**

静态服务器端口。`default`: `3000`

**defaultFile**

启动服务器默认打开的文件，当设置`listdir`为`true`时将不会生效。`default`: `index.html`

**https**

静态服务器是否使用`https`协议。`default`: `false`

**open**

是否启动服务器同时打开浏览器。`default`: `true`

**debug**

在控制台打印日志，当为`true`会答打印每条请求的日志。`default`: `false`

**livereload.enable**

是否开启livereload功能，监听文件变化自动重新加载。`default`: `true`

**livereload.port**

livereload所需文件服务器端口。`default`: `35729`

**livereload.filter**

过滤不需要重新加载的文件。

**livereload.clientConsole**

是否劫持`console`，开启之后将会把每一条`console`信息发送到server控制台。当在webview远程调试的时候，你可以开启此功能，它会把你的js错误信息发送到server控制台。如果你想在浏览器控制台使用原生的`console`功能，请使用`__console`。`default`: `false`

**listdir**

启动服务器的时候是否列出当前文件夹文件列表。`default`: `true`

**proxy.enable**

是否开启接口代理功能。`default`: `false`

**proxy.host**

通过`proxy.urls`匹配到的`url`都会到这个`host`下面去请求。

**proxy.urls**

可以是一个数组，每一项都可以是一个正则对象或者字符串；也可以是一个单独的正则对象或者字符串，用来匹配相关的请求url，匹配到的url都会去`proxy.host`请求数据。eg:

	// server config
	proxy: {
		enable: true,
		host: 'http://w3cboy.com',
		urls: '/api/list'
	}

	// client
	$.getJSON('/api/list', function (data) {
		console.log(data);
	});

那么收到如上ajax请求服务器会去`http://w3cboy.com/api/list`请求数据返回，于是头痛的跨域问题没有了。

**proxy.mock**

开发中经常遇到的问题是接口还没出来，没数据怎么办？你需要写一堆假数据，现在不需要了，我们只需要配置mock项。

	proxy: {
		enable: true,
		mock: {
			'/api/list': {
				'list|1-10': [{
        			'id|+1': 1,
        			'email': '@EMAIL'
    			}]
			}
		}
	}

关于mock数据模板的详细用法请参考：[Mock.js](http://mockjs.com/#mock)

`proxy.mock`的优先级比`proxy.urls`要高，因此匹配到mock了就会去走mock，匹配不到的依然走`proxy.urls`。




















