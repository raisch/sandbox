// simple browser asset loader - supports both .js and .css

  /**
   * load
   * @param array<string> paths paths to assets
   * @param function cb callback to invoke once all assets have loaded
   */
   
  function load(paths, cb){
		var len=paths.length, count=0;

		function onScriptLoaded(path){ // if all scripts have been loaded, call cb
			count++;
			console.log('loaded %s of %s (%s)', count, len, path);
			if(count === len && 'function' === typeof cb) cb(count, paths);
		}

		function addScript(path){
			var type=path.toLowerCase().match(/\.js$/) ? 'js' : 'css',
				targ=('js' === type)
					? document.getElementsByTagName('body')[0]
					: document.getElementsByTagName('head')[0],
				el=document.createElement(type === 'js' ? 'script' : 'link'),
				loaded=false,
				onLoad=function(){
					if((el.readyState && el.readyState !== "complete" && el.readyState !== "loaded")
						|| loaded){
						return false;
					}

					el.onload=
						el.onreadystatechange=
							null;

					loaded=true;

					onScriptLoaded(path);
				};

			el.onload=
				el.onreadystatechange=
					onLoad;

			switch(type){
				case 'js':
					el.src=path;
					el.async=false;
					break;
				case 'css':
					el.rel='stylesheet';
					el.href=path;
					break;
			}
      
			// console.log('inserting "%s":"%s"', type, path);
      
			targ.insertBefore(el, targ.lastChild);
		}

		for(var i=0; i<len; i++){
			addScript(paths[i]);
		}
	}
