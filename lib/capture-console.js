(function(window) {
    var socket = window.__socket;
    var __console = window.console;
    var methods = ['info', 'log', 'error', 'warn'];
    if (!socket) {
        return;
    }
    window.console = {};
    for (var i = 0; i < methods.length; i++) {
        window.console[methods[i]] = (function(method) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                try {
                    socket.emit('console_' + method, args);
                } catch (e) {
                    __console.error(e);
                }
                if (__console[method]) {
                    __console[method].apply(null, args);
                }
            };
        })(methods[i]);
    }
    window.__console = __console;
})(window);
