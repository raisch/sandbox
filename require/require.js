// require.js - 20110630 RR

// require(uri,cb)
// @param uri a uri to the file to be required (must be either .js or .css)
// @param cb callback on file loaded

function require(uri,cb) {
	var ext=uri.match(/^.*\/.*\.(\w+)/) && RegExp.$1.toString().toUpperCase(),
		type = ( ext === 'JS' ? 'text/javascript' : (ext === 'CSS' ? 'text/css' : null ) ),
		tag = (ext === 'JS' ? 'script' : 'link'),
		elt = document.createElement(tag);
		
	console.log('requiring "'+uri+'" as "'+type+'" into "<'+tag+'>"');
	
	if(!type) {
		throw('uri "'+uri+'" must be either .js or .css');
	}
	
	elt.type=type;
	elt[tag === 'script' ? 'src' : 'href']=uri;
	tag === 'link' && (elt.rel='stylesheet');
	
	if(cb && typeof cb === 'function') {
		// for IE
		if(navigator && navigator.appName && navigator.appName.indexOf('Microsoft') === 0) {
			elt.onreadystatechange=function() {
				if(this.readyState === 'complete' || this.readyState === 'loaded') {
					cb();
				}
			};
		}
		else { // for everybody else
			elt.onload=cb;
		}
	}
	
	function init(tag,elt) {
		document.getElementsByTagName(tag==='script'?'body':'head')[0].appendChild(elt);
	}
	
	if(document.loaded) {
			init(tag,elt);
	}
	else {
		if(window.addEventListener) {
			window.addEventListener('load', init.bind(null,tag,elt), false);
		}
		else {
			window.attachEvent('onload', init.bind(null,tag,elt));
		}
	}
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
})('require.js');