// runner.js 20110630 RR

var Mixin,
	EventListener,
	Runner;

(function($){

	if(!Array.prototype.flatten) {
		Array.prototype.flatten = function() {
		    var r = [];
		    for (var i = 0; i < this.length; ++i) {
		        var v = this[i];
		        if (v instanceof Array) {
		            Array.prototype.push.apply(this, v.flatten());
		        } else {
		            r.push(v);
		        }
		    }
		    return r;
		};
	}
	
	if(!Object.prototype.mixin) {
		Object.prototype.mixin=function(){
			var sources=Array.prototype.slice.call(arguments);
			for(var i=0,len=sources.length;i<len;i++) {
				for(var name in sources[i].prototype) {
					this.prototype[name] = sources[i].prototype[name];
				}
			}
			return this;
		};
	}
	
	// EventListener
	
	EventListener=function() {};
	
	EventListener.prototype.addListener=function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener);
    };
    
	EventListener.prototype.removeListener=function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    };
	
	EventListener.prototype.fire=function(evt){
        if (typeof evt == "string"){
            evt = { type: evt };
        }
        if (!evt.target){
            evt.target = this;
        }

        if (!evt.type){  //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[evt.type] instanceof Array){
            var listeners = this._listeners[evt.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, evt);
            }
        }
    };
	
    // Runner 
	Runner=function(){
	
		// tasks
		this._queue = (arguments.length >= 0 ? Array.prototype.slice.call(arguments) : [] );
		
		// events
		this._listeners={};
		
		// if true, print info
		this._verbose=true;
		
		// default event handlers
		this._handlers={
			
			 // default error handler
			'onError': function(err,args) {
				throw new Error(err + ' with result = ['+args+']');
				return false;
			}.bind(this),
			
			// default completed handler
			'onComplete': function(result) { 
				if(this._verbose) {
					console.log('completed with result = ['+result.args+']');
				}
			}.bind(this)
		};
		
		// handle onNext event
		this.addListener('onNext',function(evt){
			if(this._queue.length) {
				(this._queue.shift().bind(this))(evt.args);
			}
			else {
				this.fire({type:'onComplete',args:evt.args});
			}
		});
		
		// handle onLast event
		this.addListener('onLast',function(evt){
			var handler=this._handlers['onComplete'];
			this._queue=[];
			if(handler) handler(evt.args);
		});
		
		// handle onError event
		this.addListener('onError',function(evt){
			var handler=this._handlers['onError'];
			if(handler) handler(evt.err, evt.args);
		});
		
		// handle onComplete event
		this.addListener('onComplete',function(evt){
			var	handler=this._handlers['onComplete'];
			if(handler) handler(evt.args);
		});
		
		return this;
	}.mixin(EventListener);
    
    // Original
	
	Runner.prototype.setHandler=function(eventName,handler) {
		this._handlers[eventName]=handler.bind(this);
	};
	
	Runner.prototype.add=function(func){
		this._queue.push(func);
	};
	
	Runner.prototype.next=function(args){
		//var args=Array.prototype.slice.call(arguments);
		//$(this).trigger('onNext', args);
		this.fire({ type:'onNext', args:args });
	};
	
	Runner.prototype.last=function(args){
		//var args=Array.prototype.slice.call(arguments);
		//$(this).trigger('onLast',args);
		this.fire({ type:'onLast', args:args });
	};
	
	Runner.prototype.error=function(err, args){
		//var args=Array.prototype.slice.call(arguments);
		//$(this).trigger('onError', args);
		this.fire({ type:'onError', err:err, args:args });
	};
	
	Runner.prototype.start=function(){
		var args=Array.prototype.slice.call(arguments);
		if(this._verbose) {
			console.log('starting (args=['+args+'])');
		}
		if(this._queue.length) {
			(this._queue.shift().bind(this))(args);
		}
	};
	
})(jQuery);

// automagic execution of script tag contents
(function(scriptName){
	
	var re=new RegExp('\\b'+scriptName+'\\b','i');
	
	if(!NodeList.prototype.toArray) {
		NodeList.prototype.toArray=function() {
			var result=[];
			for(var i=0,len=this.length;i++<len;) {
				result.push(this[i]);
			}
			return result;
		};
	}
		
	document.getElementsByTagName('script').toArray().forEach(function(elt){
		if(elt && elt.type.toLowerCase() === 'text/javascript' && elt.src && elt.src.match(re)) {
			if(elt.innerText) {
				eval(elt.innerText);
			}
		}
	});
})('runner.js');
