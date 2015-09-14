'use strict';

var chalk = require('chalk');

// 此处不包含function
function isObject(value) {
    var type = typeof value;
    return !!value && type === 'object';
};

exports.isRegExp = function(value) {
    return isObject(value) && Object.prototype.toString.call(value) === '[object RegExp]';
};

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
