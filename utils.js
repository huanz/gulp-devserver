'use strict';

var chalk = require('chalk');
var toString = Object.prototype.toString;
var isType = function(type) {
    return function (obj) {
        return toString.call(obj) === '[object ' + type + ']';
    };
};

var isObject = isType('Object');
exports.isRegExp = isType('RegExp');

exports.isArray = function(value) {
    return Array.isArray(value);
};

function extend() {
    var i = 1;
    var target = arguments[0] || {};
    var len = arguments.length;
    var obj, keys, j;
    for (; i < len; i++) {
        obj = arguments[i];
        if (isObject(obj)) {
            keys = Object.keys(obj);
            j = keys.length;
            while (j--) {
                target[keys[j]] = isObject(obj[keys[j]]) ? extend(target[keys[j]], obj[keys[j]]) : obj[keys[j]];
            }
        }
    }
    return target;
};

exports.extend = extend;

var logPrefix = function() {
    var now = new Date();
    var str = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    return '[' + chalk.cyan(str) + ']';
};

exports.log = function() {
    process.stdout.write(logPrefix() + ' ');
    console.log.apply(console, arguments);
    return this;
};

exports.colors = chalk;
