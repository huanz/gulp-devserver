(function(window) {
    var socket = window.__socket;
    var methods = ['info', 'log', 'error', 'warn'];
    if (!socket) {
        return;
    }
    for (var i = 0; i < methods.length; i++) {
        window.console[methods[i]] = (function(method) {
            return function() {
                try {
                    socket.emit('console_' + method, Array.prototype.slice.call(arguments));
                } catch (e) {
                    this.apply(console, e);
                }
                this.apply(console, arguments);
            }.bind(window.console[methods[i]]);
        })(methods[i]);
    }
})(window);

