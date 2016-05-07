var _ = require("lodash");
var crypto = require("crypto");
var async = require("async");

module.exports = FIDOServer;

function FIDOServer(opt) {
    opt = opt || {};

    var defaults = {
        rpid: "example.com", // TLD + 1
        blacklist: [],
        cryptoParameterPrefs: [],
        modules: {
            audit: "./audit.js",
            comm: "./comm.js",
            riskengine: "./riskengine.js",
            mdsclient: "./mdsclient.js", // TODO: rename to metadata manager?
            extension: "./extension.js",
            account: "./account.js",
        }
    };
    _.defaultsDeep(opt, defaults);

    // TODO: use 'rc' for options
    // opts:
    // - server rpid
    // - server SSL cert
    // - audit file
    // - audit stdout
    // - audit level
    // - audit app name
    // - account waterline orm adapter
    // TODO: validate options

    this.opt = opt;
}

function loadModule(ext) {
    var module, Module, ret;
    if (typeof ext === "string") {
        console.log ("Loading " + ext + " ...");
        Module = require (ext);
        module = new Module();
        // return a promise
        return module.init(this); 
    }

    // either it's already a promise, 
    // or Promise will resolve it to whatever it already is
    return ext; 
}

FIDOServer.prototype.init = function() {
    console.log ("Initializing ...");
    return new Promise(function(resolve, reject) {
        var modules = _.mapValues (this.opt.modules, loadModule);
        var moduleNames = _.keys (modules);
        var promiseList = _.values (modules);

        Promise.all(promiseList)
            .then(function(res) {
                var finalModules = _.zipObject (moduleNames, res);
                _.extend (this, finalModules);
                resolve(this);
            })
            .catch(function(err) {
                reject(err);
            });
    }.bind(this));
};

FIDOServer.prototype.shutdown = function() {
    return new Promise(function(resolve, reject) {
        // TODO: shutdown modules
    }.bind(this));
};

FIDOServer.prototype.makeCredentialParms = function(cb) {
    var ret = {};
    // ret.accountInformation = {};
    // ret.sessionId = 
    // ret.blacklist = [];
    // ret.credentialExtensions = [];
    ret.cryptoParameters = [];
    ret.attestationChallenge = crypto.randomBytes(256).toString("hex");

    cb(null, ret);
};

FIDOServer.prototype.makeCredentialResponse = function(res, ctx, cb) {
    console.log(res);
    console.log(ctx);
    // res.credential
    // res.publicKey
    // res.attestation
    // save key and credential with account information

    cb(null, null);
};

FIDOServer.prototype.getAssertionParams = function(cb) {
    var ret = {};
    // ret.sessionId = 
    // ret.assertionChallenge = 
    // ret.whitelist =
    // ret.assertionExtensions =

    cb(null, ret);
};

FIDOServer.prototype.getAssertionResponse = function(res, ctx, cb) {
    console.log(res);
    console.log(ctx);
    // res.credential = 
    // res.clientData =
    // res.authenticatorData =
    // res.signature = 

    cb(null, null);
};