// runner.js 20110630 RR
console.log('runner.js');

var EventListener, Runner;

(function() {

    // Function.prototype.bind polyfill - from developer.mozilla.org
    // 		https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(obj) {
            if (typeof this !== 'function') 
            	throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            var slice = [].slice,
            	args = slice.call(arguments, 1),
            	self = this,
           		nop = function() {},
           		bound = function() {
                	return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
           		 };
            bound.prototype = this.prototype;
            return bound;
        };
    }

    if (!Object.prototype.mixin) {
        Object.prototype.mixin = function() {
            var sources = Array.prototype.slice.call(arguments);
            for (var i = 0, len = sources.length; i < len; i++) {
                for (var name in sources[i].prototype) {
                    this.prototype[name] = sources[i].prototype[name];
                }
            }
            return this;
        };
    }

    // EventListener
    EventListener = function() {};

    EventListener.prototype.addListener = function(type, listener) {
        if (typeof this._listeners[type] == "undefined") {
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener);
    };

    EventListener.prototype.removeListener = function(type, listener) {
        if (this._listeners[type] instanceof Array) {
            var listeners = this._listeners[type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    };

    EventListener.prototype.fire = function(evt) {
        if (typeof evt == "string") {
            evt = {
                type: evt
            };
        }
        if (!evt.target) {
            evt.target = this;
        }

        if (!evt.type) { //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[evt.type] instanceof Array) {
            var listeners = this._listeners[evt.type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(this, evt);
            }
        }
    };

    // Runner 
    Runner = function() {

        // tasks
        this._queue = (arguments.length >= 0 ? Array.prototype.slice.call(arguments) : []);

        // events
        this._listeners = {};

        // if true, print info
        this._verbose = true;

        // default event handlers
        this._handlers = {

            // default start handler
            'onStart': (function(args) {
                if (this._verbose) {
                    console.log('starting with args = [' + args + ']');
                }
            }).bind(this),

            // default completed handler
            'onComplete': function(args) {
                if (this._verbose) {
                    console.log('completed with args = [' + args + ']');
                }
            }.bind(this),

            // default error handler
            'onError': function(err, args) {
                throw new Error(err + ' with args = [' + args + ']');
                return false;
            }.bind(this)

        };

        // handle onStart event
        this.addListener('onStart', function(evt) {
            var handler = this._handlers['onStart'];
            if (handler) handler(evt.args);
        });

        // handle onNext event
        this.addListener('onNext', function(evt) {
            if (this._queue.length) {
                (this._queue.shift().bind(this))(evt.args);
            }
            else {
                this.fire({
                    type: 'onComplete',
                    args: evt.args
                });
            }
        });

        // handle onLast event
        this.addListener('onLast', function(evt) {
            this._queue = [];
            this.fire({
                type: 'onComplete',
                args: evt.args
            });
        });

        // handle onComplete event
        this.addListener('onComplete', function(evt) {
            var handler = this._handlers['onComplete'];
            if (handler) handler(evt.args);
        });

        // handle onError event
        this.addListener('onError', function(evt) {
            var handler = this._handlers['onError'];
            if (handler) handler(evt.err, evt.args);
        });

        return this;
    }.mixin(EventListener);

    // Original
    Runner.prototype.setHandler = function(eventName, handler) {
        this._handlers[eventName] = handler.bind(this);
        return this;
    };

    Runner.prototype.add = function(func) {
        this._queue.push(func);
        return this;
    };

    Runner.prototype.next = function(args) {
        this.fire({
            type: 'onNext',
            args: args
        });
        return this;
    };

    Runner.prototype.last = function(args) {
        this.fire({
            type: 'onLast',
            args: args
        });
        return this;
    };

    Runner.prototype.error = function(err, args) {
        this.fire({
            type: 'onError',
            err: err,
            args: args
        });
        return this;
    };

    Runner.prototype.start = function() {
        var args = Array.prototype.slice.call(arguments);

        this.fire({
            type: 'onStart',
            args: args
        });

        if (this._queue.length) {
            (this._queue.shift().bind(this))(args);
        }
        else {
            this.fire({
                type: 'onComplete',
                args: args
            });
        }

        return this;
    };

})();

// automagic execution of script tag contents
(function(scriptName) {
    var re = new RegExp('\\b' + scriptName + '\\b', 'i');

    for (var scripts = document.getElementsByTagName('script'), i = 0, len = scripts.length; i < len; i++) {
        var elt = scripts[i];
        if (elt && elt.type.toLowerCase() === 'text/javascript' && elt.src && elt.src.match(re)) {
            var code = elt.text || elt.innerText || elt.innerHTML;
            if (code) {
                eval(code);
            }
        }
    }
})('runner.js');