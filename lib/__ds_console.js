(function(window) {
    var socket = window.__ds__ && window.__ds__.socket;
    // 保存原始的console
    var __console = window.console;
    var console = window.console;
    var methods = ['info', 'log', 'error', 'warn'];
    var slice = Array.prototype.slice;
    var i = 0;
    if (!socket) {
        return;
    }
    for (; i < methods.length; i++) {
        console[methods[i]] = (function(func, method) {
            return function() {
                var args = slice.call(arguments);
                try {
                    socket.emit('console:' + method, args);
                } catch (e) {
                    console.error(e);
                }
                func.apply(console, args);
            };
        })(console[methods[i]], methods[i]);
    }
    window.console = console;
    window.__console = __console;
})(window);
