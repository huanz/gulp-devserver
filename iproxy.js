'use strict';

var url = require('url');
var request = require('request');
var Mock = require('mockjs');

var utils = require('./utils');

function iProxy(opt) {
    // 是否需要mock数据
    var isMock = function(u) {
        return opt.mock[url.parse(u).pathname];
    };
    // 是否需要代理此接口
    var proxyUrls = utils.isArray(opt.urls) ? opt.urls : [opt.urls];
    var isProxy = function(u) {
        return proxyUrls.some(function(proxyUrl) {
            return utils.isRegExp(proxyUrl) ? proxyUrl.test(u) : proxyUrl === u;
        });
    };
    return function(req, res, next) {
        var m = isMock(req.url);
        if (m) {
            res.end(Mock.mock(m));
        } else if (isProxy(req.url) && opt.host) {
            req.headers['Host'] = opt.host.replace(/^https?:\/\//, '');
            request({
                method: req.method,
                url: opt.host + req.url,
                headers: req.headers
            }).pipe(res);
        } else {
            next();
        }
    };
};

module.exports = iProxy;
