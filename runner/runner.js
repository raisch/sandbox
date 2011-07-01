// runner.js 20110630 RR

// requires util.js, EventListener.js

var Runner;

(function() {
    
    // Runner 
    Runner = function() {

        // tasks
        this._queue = (arguments.length >= 0 ? Array.prototype.slice.call(arguments) : []);

        // events - required by EventListener.js
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
        this.addListener('onStart', function(evt) { // from EventListener.js
            var handler = this._handlers['onStart'];
            if (handler) handler(evt.args);
        });

        // handle onNext event
        this.addListener('onNext', function(evt) { // from EventListener.js
            if (this._queue.length) {
                (this._queue.shift().bind(this))(evt.args);
            }
            else {
                this.fire({ // from EventListener.js
                    type: 'onComplete',
                    args: evt.args
                });
            }
        });

        // handle onLast event
        this.addListener('onLast', function(evt) { // from EventListener.js
            this._queue = [];
            this.fire({ // from EventListener.js
                type: 'onComplete',
                args: evt.args
            });
        });

        // handle onComplete event
        this.addListener('onComplete', function(evt) { // from EventListener.js
            var handler = this._handlers['onComplete'];
            if (handler) handler(evt.args);
        });

        // handle onError event
        this.addListener('onError', function(evt) { // from EventListener.js
            var handler = this._handlers['onError'];
            if (handler) handler(evt.err, evt.args);
        });

        return this;
    };
    
    Runner.mixin(EventListener); // from util.js

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
        this.fire({ // from EventListener.js
            type: 'onNext',
            args: args
        });
        return this;
    };

    Runner.prototype.last = function(args) {
        this.fire({ // from EventListener.js
            type: 'onLast',
            args: args
        });
        return this;
    };

    Runner.prototype.error = function(err, args) {
        this.fire({ // from EventListener.js
            type: 'onError',
            err: err,
            args: args
        });
        return this;
    };

    Runner.prototype.start = function() {
        var args = Array.prototype.slice.call(arguments);

        this.fire({ // from EventListener.js
            type: 'onStart',
            args: args
        });

        if (this._queue.length) {
            (this._queue.shift().bind(this))(args);
        }
        else {
            this.fire({ // from EventListener.js
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