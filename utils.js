'use strict';

function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
};

exports.isObject = isObject;

exports.isRegExp = function (value) {
    return isObject(value) && Object.prototype.toString.call(value) === '[object RegExp]';
};

exports.isArray = function (value) {
    return Array.isArray(value);
};

exports.extend = function () {
    var i = 1,
        target = arguments[0],
        len = arguments.length;
    var obj,keys,j;
    for (; i < len; i++) {
        obj = arguments[i];
        if (isObject(obj)) {
            keys = Object.keys(obj);
            j = keys.length;
            while (j--) {
                target[keys[j]] = obj[keys[j]];
            }
        }
    }
    return target;
}


