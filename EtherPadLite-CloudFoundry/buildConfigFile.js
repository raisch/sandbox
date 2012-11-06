/*
 * buildConfigFile.js
 *
 * author: raisch <raisch@gmail.com>
 * version: 0.1
 *
 * Since EtherPad Lite (EPL) requires a JSON configuration file and Cloud 
 * Foundry only provides certain operational parameters in the process 
 * environment, this script will construct a valid JSON config file using 
 * those parameters.
 *
 * NOTE: The following installation instructions **ASSUME** a standard 
 * install of EPL.
 *
 * Installation:
 *
 * 1. Add this script under the root of your EPL installation as:
 *		./bin/buildConfigFile.js
 *
 * 2. Modify EPL's standard "./start.bat" * to invoke this script 
 * before invoking the EPL node server, as in:
 *
 * Original ./start.bat:
 *
 * line #1: node node_modules\ep_etherpad-lite\node\server.js
 *
 * Modified ./start.bat
 *
 * line #1: node ./bin/buildConfigFile.js
 * line #2: node node_modules\ep_etherpad-lite\node\server.js
 *
 * 3. Start EPL ./start.bat
 *
 */
var util=require('util'),			// requires isArray
	fs=require('fs'),				// requires writeFileSync
	ENV=process.env,				// process environment
	configPath='./settings.json';	// location of the EPL settings file

// make sure we can find our host, port and services in ENV
var app={
		host:ENV.VCAP_APP_HOST||'',
		port:ENV.VCAP_APP_PORT||''
	},
	services=ENV.VCAP_SERVICES||{};
if(!app.host) throw new Error('failed to find VCAP_APP_HOST in ENV');
if(!app.port) throw new Error('failed to find VCAP_APP_PORT in ENV');
if(!services) throw new Error('failed to find VCAP_SERVICES in ENV');

// make sure we can find our etherpadDB instance in ENV
if(!services.etherpadDB) throw new Error('failed to find VCAP_SERVICES.etherpadDB');
if(!util.isArray(services.etherpadDB)) throw new Error('VCAP_SERVICES.etherpadDB is not an array');
var etherpadDB=services.etherpadDB[0];
if(!etherpadDB) throw new Error('failed to find VCAP_SERVICES.etherpadDB in ENV');

// make sure we can find our database config in ENV
var db={
	user:(etherpadDB.credentials && 'object'===typeof etherpadDB.credentials) 
		? etherpadDB.credentials.user
		: '',
	host:etherpadDB.host||'',
	password:etherpadDB.password||'',
	name:etherpadDB.name||''
};
if(!db.user) throw new Error('failed to find dbuser ENV.VCAP_SERVICES.etherpadDB[0].credentials.user');
if(!db.host) throw new Error('failed to find dbuser ENV.VCAP_SERVICES.etherpadDB[0].host');
if(!db.password) throw new Error('failed to find dbuser ENV.VCAP_SERVICES.etherpadDB[0].password');
if(!db.name) throw new Error('failed to find dbuser ENV.VCAP_SERVICES.etherpadDB[0].name');

// ok, we have everyting, let's make an object we can save to JSON
var config={
	//Ip and port which etherpad should bind at
	ip:   app.host,
	port: app.port,

	//The Type of the database. You can choose between dirty, postgres, sqlite and mysql
	//You shouldn't use "dirty" for for anything else than testing or development
	/*"dbType" : "dirty",*/

	//the database specific settings
	/*"dbSettings" : { "filename" : "var/dirty.db" },*/

	/* An Example of MySQL Configuration */
	dbType:"mysql",
	dbSettings: {
		user:     db.user,
		host:     db.host,
		password: db.password,
		database: db.name
	}
};

// write the result to configPath
fs.writeFileSync(configPath, JSON.stringify(config));

// done.
process.exit(0);
