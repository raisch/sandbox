    /*

     Example of using events to orchestrate program flow in an async
     environment.

     */

    var util = require('util'),
        EventEmitter = require('events').EventEmitter;

    // mocks

    /**
     * Class for app object (MOCK)
     * @constructor
     * @augments EventEmitter
     */
    var App = function (handlers) {
      EventEmitter.call(this);
      this.init(handlers);
    };
    util.inherits(App, EventEmitter);

    /**
     * Inits instance by setting event handlers
     *
     * @param {object} handlers
     * @returns {App}
     */
    App.prototype.init = function (handlers) {
      var self = this;
      // set event handlers
      Object.keys(handlers).forEach(function (name) {
        self.on(name, handlers[name]);
      });
      return self;
    };

    /**
     * Invokes callback with req and res
     * @param uri
     * @param {App~getCallback} cb
     */
    App.prototype.get = function (uri, cb) {

      console.log('in app.get');

      var req = {uri: uri},
          res = {uri: uri};
      /**
       * @callback App~getCallback
       * @param {object} req - http request
       * @param {object} res - http response
       * @fires {App#event:get}
       */
      cb(req, res);
    };

    /**
     * Data access adapter - (MOCK)
     * @type {object}
     */
    var User2Model = {};
    /**
     *
     * @param {User2Model~findCallback} cb
     */
    User2Model.find = function (cb) {
      var err = null,
          users = [
            {_id: 1},
            {_id: 2}
          ];
      /**
       * @callback User2Model~findCallback
       * @param {Error} err
       * @param {Array} users
       */
      cb(err, users);
    };


    // events

    /**
     * Error event.
     *
     * @event App#error
     * @type {object}
     * @property {object} [req] - http request
     * @property {object} [res] - http response
     * @property {string} where - name of the function in which the error occurred
     * @property {Error} err - the error object
     */

    /**
     * Get event - called with the result of app.get
     *
     * @event App#get
     * @type {object}
     * @property {object} req - http request
     * @property {object} res - http response
     */

    /**
     * ProcessUsers event - called
     *
     * @event App#processUsers
     * @type {object}
     * @property {object} req - http request
     * @property {object} res - http response
     * @property {Array} users - users
     */

    /**
     * NextUser event.
     *
     * @event App#nextUser
     * @type {object}
     * @property {object} req - http request
     * @property {object} res - http response
     * @property {Array} users
     * @property {*} last_id
     * @property {object} result
     */

    /**
     * Complete event.
     *
     * @event App#complete
     * @type {object}
     * @property {object} req - http request
     * @property {object} res - http response
     * @property {Array} users
     * @property {*} last_id
     * @property {object} result
     */

    // event handlers

    /**
     * Generic error handler
     *
     * @param {App#event:error} evt
     *
     * @listens App#error
     */
    var onError = function (evt) {
      console.error('program error in %s: %s', evt.where, evt.err);
      process.exit(-1);
    };

    /**
     * Event handler called with result of app.get
     *
     * @param {App#event:get} evt - the event object
     *
     * @listens App#appGet
     * @fires App#error
     * @fires App#processUsers
     */
    var onGet = function (evt) {
      console.log('in onGet');
      var self = this;
      User2Model.find(function (err, users) {
        if (err) {
          console.log('\tonGet emits an error');
          return self.emit('error', {
            res:evt.res,
            req:evt.req,
            where: 'User2Model.find',
            err: err
          });
        }
        self.emit('processUsers', {
          //req:req,
          //res:res,
          users: users
        });
      });
    };

    /**
     * Handler called to process users array returned from User2Model.find
     *
     * @param {App#event:processUsers} evt - event object
     * @property {object} req - http request
     * @property {object} res - http response
     * @property {Array} users - array of Users
     *
     * @listens {App#event:processUsers}
     * @fires {App#event:nextUser}
     */
    var onProcessUsers = function (evt) {
      console.log('in onProcessUsers: %s', util.inspect(evt));
      var self = this;
      evt.last_id = null;
      evt.result = {};
      self.emit('nextUser', evt);
    };

    /**
     * Handler called to process a single user
     *
     * @param evt
     * @property {Array} users
     * @property {*} last_id
     * @property {object} result
     *
     * @listens {App#event:nextUser}
     * @emits {App#event:nextUser}
     * @emits {App#event:complete}
     */
    var onNextUser = function (evt) {
      var self = this;

      console.log('in onNextUser: %s', util.inspect(evt));

      if (!(Array.isArray(evt.users) && evt.users.length > 0)) {
        return self.emit('complete', evt);
      }

      var user = evt.users.shift();

      evt.last_id = user._id;

      evt.result[evt.last_id] = user;

      self.emit('nextUser', evt);
    };

    /**
     * Handler invoked when processing is complete.
     *
     * @param evt
     * @property {Array} users
     * @property {*} last_id
     * @property {object} result
     */
    var onComplete = function (evt) {
      console.log('in onComplete: %s', util.inspect(evt));
    };

    // main entry point

    var eventHandlers = { // map our handlers to events
      error: onError,
      get: onGet,
      processUsers: onProcessUsers,
      nextUser: onNextUser,
      complete: onComplete
    };

    var app = new App(eventHandlers); // create our test runner.

    app.get('/tp/show/method', function (req, res) { // and invoke it.
      app.emit('get', {
        req: req,
        res: res
      });
      /* note:
           For this example, req and res are added to the evt
           but are ignored.

           In a working application, they would be used to
           return a result or an error, should the need arise,
           via res.send().
       */
    });

    /*

    in app.get
    in onGet
    in onProcessUsers: { users: [ { _id: 1 }, { _id: 2 } ] }
    in onNextUser: { users: [ { _id: 1 }, { _id: 2 } ], last_id: null, result: {} }
    in onNextUser: { users: [ { _id: 2 } ],
        last_id: 1,
        result: { '1': { _id: 1 } } }
    in onNextUser: { users: [],
        last_id: 2,
        result: { '1': { _id: 1 }, '2': { _id: 2 } } }
    in onComplete: { users: [],
        last_id: 2,
        result: { '1': { _id: 1 }, '2': { _id: 2 } } }

    */


