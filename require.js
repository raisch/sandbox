// require.js

function require(uri,cb) {
	var ext=uri.match(/^.*\/.*\.(\w+)/) && RegExp.$1.toString().toUpperCase(),
		type = ( 
			ext === 'JS' ? 'text/javascript' 
				: (ext === 'CSS' ? 'text/css' 
					: throw 'uri "'+uri+'" has an unknown type')
		),
		rel = '',
		tag = (ext === 'JS' ? 'script' : 'link'),
		elt = document.createElement(tag);
	(elt.type=type) && (elt[tag==='script'?'src':'href']=uri) && tag==='link' && (elt.rel='stylesheet');
	
	if(cb && typeof cb === 'function') {
		// for IE
		if(navigator && navigator.appName && navigator.appName.indexOf('Microsoft') === 0) {
			e.onreadystatechange=function() {
				if(this.readyState === 'complete' || this.readyState === 'loaded') {
					cb();
				}
			};
		}
		else { // for everybody else
			e.onload=cb;
		}
	}
	document.getElementsByTagName(tag==='script'?'body':'head')[0].appendChild(elt);
}