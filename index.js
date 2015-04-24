var debug = require('debug')('abacus:init');
var noop = function(){};
var host = require('os').hostname();
var clone = require('clone');
var request = require('superagent');
var flatten = require('flat');
require('superagent-retry')(request);


global.setImmediate = global.setImmediate || process.nextTick.bind(process);

module.exports = Abacus;


/**
 * Initialize a new `Abacus` with user, pass and and
 * optional dictionary of `options` including host.
 *   Note: all messages being tracked will flatten all nested fields i.e. { top: { nested: 'hi' } } => { "top.nested" : "hi }
 *
 * @param {String} username
 * @param {String} password
 * @param {Object} options (optional)
 * @property {Number} options.flushAt (default: 30)
 * @property {Number} options.flushAfter (default: 10000)
 * @property {String} options.host (default: 'http://localhost:8086')
 * @property {String} options.series (default: 'series_<date>')
 * @property {String} options.dbName (default: 'db_<date>')
 * @license MIT
 */


function Abacus(user, pass, opts){
    if (!(this instanceof Abacus)) return new Abacus(user, pass, opts);
    opts = opts || {};
    this.user = user;
    this.pass = pass;
    this.host    = opts.host || "http://localhost:8086";
    this.flushAt = opts.flushAt || 30;
    this.flushAfter = opts.flushAfter || 10000;
    this.dbName    = opts.dbName || ('db_' + Date.now());
    this.series    = opts.series || ('series_' + Date.now());
    this.columns   = [];
    this.queue     = [];
    debug('initialized %o ', this);
};


/**
 * Flush the current queue and callback `fn(err, batch)`.
 *
 * @param {Function} fn (optional)
 * @return {Abacus}
 */


Abacus.prototype.flush = function(fn){
    var self = this;
    fn = fn || noop;
    if(!this.queue.length) return setImmediate(fn);

    var items = this.queue.splice(0, this.flushAt);
    var fns   = items.map(function(_){ return _.callback; });
    var batch = items.map(function(_){ return _.message; });

    var packet = [{
        "name": this.series,
        "columns": this.columns,
        "points" : batch
    }];

    var req = request.post([self.host, 'db', self.dbName, 'series'].join('/'));

    req
        .auth(this.user, this.pass)
        .retry(3)
        .send(packet)
        .end(function(err, res){
            err = err || error(res);
            fns.push(fn);
            fns.forEach(function(fn){ return fn(err, packet); });
            debug('flushed %o', packet);
        });


};

/**
 * Add a `message` to the queue and check whether it should be
 * flushed.
 *
 * @param {Object} message fields
 * @param {Functino} fn (optional)
 * @api private
 */


Abacus.prototype.track = function(message, fn){
    var self = this;
    fn = fn || noop;
    message = clone(message);
    message = flatten(message);
    if(!message.time) message.time = Date.now();
    if(!message.host) message.host = host;
    if(!message.pid) message.pid = process.pid;
    var pt = [];
    for(var x in message){
        var k = x.toLowerCase();
        var i = this.columns.indexOf(k);
        if(!~i){
           i = this.columns.push(k)-1;
        }
        pt[i] = message[x];
    }
    this.queue.push({message: pt, callback: fn});
    if (this.queue.length >= this.flushAt) this.flush();
    if (this.timer) clearTimeout(self.timer);
    if (this.flushAfter) this.timer = setTimeout(self.flush.bind(self), self.flushAfter);
};

/**
 * Get an error from a `res`.
 *
 * @param {Object} res
 * @return {String}
 */

function error(res){
    if (!res.error) return;
    var body = res.body;
    var msg = body.error && body.error.message
        || res.status + ' ' + res.text;
    return new Error(msg);
}
