
// Function.prototype.bind polyfill - from developer.mozilla.org (for IE)
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
})('utils.js');