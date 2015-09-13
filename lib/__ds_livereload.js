(function(window) {
    'use strict';
    var options = {
        tagNames: {
            'css': 'link',
            'jpg': 'img',
            'jpeg': 'img',
            'png': 'img',
            'svg': 'img',
            'gif': 'img',
            'js': 'script'
        },
        attrs: {
            'link': 'href',
            'img': 'src',
            'script': 'src'
        }
    };
    var __ds__ = window.__ds__ = {
        doc: window.document,
        init: function() {
            var _this = this;
            var socket = this.socket = window.io.connect(this.getServerUrl());
            socket.on('connect', function() {
                console.log('successfully connected');
            });
            socket.on('connect_error', function(err) {
                console.log('failed to connect: ' + err);
            });
            socket.on('file:change', function(file) {
                try {
                    _this.reload(file);
                } catch (err) {
                    console.error(err);
                }
            });
        },
        getServerUrl: function() {
            var url = this.doc.getElementById('__ds_socket__').src;
            var parser = this.parseUrl(url);
            return parser.protocol + '//' + parser.host;
        },
        reload: function(file) {
            if (!file) {
                return;
            }
            var tagName = this.getTagName(file.ext);
            if (file.ext === 'css') {
                var els = this.doc.getElementsByTagName(tagName);
                var len = els.length;
                var attr = this.getAttr(tagName);
                for (var i = 0; i < len; i++) {
                    if (els[i][attr].indexOf(file.name) !== -1) {
                        this.reloadCss(els[i], attr);
                    }
                }
            } else {
                this.reloadBrowser();
            }
        },
        reloadCss: function(el, attr) {
            var _this = this;
            el[attr] = el[attr];
            setTimeout(function() {
                if (_this.hackEl) {
                    _this.hackEl.style.display = 'none';
                    _this.hackEl.style.display = 'block';
                } else {
                    _this.hackEl = _this.doc.createElement('DIV');
                    _this.doc.body.appendChild(_this.hackEl);
                }
            }, 200);
        },
        reloadBrowser: function() {
            window.location.reload(true);
        },
        getTagName: function(ext) {
            return options.tagNames[ext];
        },
        getAttr: function(tagName) {
            return options.attrs[tagName];
        },
        parseUrl: function (url) {
            var parser = this.doc.createElement('a');
            parser.href = url;
            return parser;
        }
    };
    __ds__.init();
})(window);
