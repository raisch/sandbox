// runner.js 20110630 RR

var EventTarget;

(function(){
	
	EventTarget=function(){
		this._listeners={};
	};
	
	EventTarget.prototype = {
	
	    constructor: EventTarget,
	
	    addListener: function(type, listener){
	        if (typeof this._listeners[type] == "undefined"){
	            this._listeners[type] = [];
	        }
	        this._listeners[type].push(listener);
	    },
	
	    fire: function(event){
	        if (typeof event == "string"){
	            event = { type: event };
	        }
	        if (!event.target){
	            event.target = this;
	        }
	
	        if (!event.type){  //falsy
	            throw new Error("Event object missing 'type' property.");
	        }
	
	        if (this._listeners[event.type] instanceof Array){
	            var listeners = this._listeners[event.type];
	            for (var i=0, len=listeners.length; i < len; i++){
	                listeners[i].call(this, event);
	            }
	        }
	    },
	
	    removeListener: function(type, listener){
	        if (this._listeners[type] instanceof Array){
	            var listeners = this._listeners[type];
	            for (var i=0, len=listeners.length; i < len; i++){
	                if (listeners[i] === listener){
	                    listeners.splice(i, 1);
	                    break;
	                }
	            }
	        }
	    }
	};
})();

var Runner;

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
	
	Runner=function(){
	
		// task storage
		this._queue = (arguments.length >= 0 ? Array.prototype.slice.call(arguments) : [] );
		
		// if true, print info
		this._verbose=true;
		
		// default event handlers
		this._handlers={
			
			 // default error handler
			'onError': function(err,args) {
				var result=args ? args.flatten().reverse() : [];
				throw new Error(err + ' with result = ['+result+']');
				return false;
			}.bind(this),
			
			// default completed handler
			'onComplete': function(args) { 
				var result=args.flatten().reverse();
				if(this._verbose) {
					console.log('completed with result = ['+result+']');
				}
			}.bind(this)
		};
		
		// onNext handler
		$(this).bind('onNext',function(){
			var args=Array.prototype.slice.call(arguments).slice(1);
			if(this._queue.length) {
				(this._queue.shift().bind(this))(args);
			}
			else {
				$(this).trigger('onComplete', args);
			}
		});
		
		// handle onLast event
		$(this).bind('onLast',function(){
			var args=Array.prototype.slice.call(arguments),
				handler=this._handlers['onComplete'];
			this._queue=[];
			if(handler) handler(args);
		});
		
		// handle onComplete event
		$(this).bind('onComplete',function(){
			var args=Array.prototype.slice.call(arguments).slice(1),
				handler=this._handlers['onComplete'];
			if(handler) handler(args);
		});
		
		// handle onError event
		$(this).bind('onError',function(){
			var args=Array.prototype.slice.call(arguments).slice(1),
				err=args.shift(),
				handler=this._handlers['onError'];
			if(handler) handler(err,args);
		});
		
		return this;
	};
	
	Runner.prototype.setHandler=function(eventName,handler) {
		this._handlers[eventName]=handler.bind(this);
	};
	
	Runner.prototype.add=function(func){
		this._queue.push(func);
	};
	
	Runner.prototype.next=function(){
		var args=Array.prototype.slice.call(arguments);
		$(this).trigger('onNext', args);
	};
	
	Runner.prototype.last=function(){
		var args=Array.prototype.slice.call(arguments);
		$(this).trigger('onLast',args);
	};
	
	Runner.prototype.error=function(){
		var args=Array.prototype.slice.call(arguments);
		$(this).trigger('onError', args);
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

// automagic 
(function(scriptName){
	
	var re=new RegExp('\\b'+scriptName+'\\b');
	
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
		if(elt && elt.type === 'text/javascript' && elt.src && elt.src.match(re)) {
			if(elt.innerText) {
				eval(elt.innerText);
			}
		}
	});
})('runner.js');
