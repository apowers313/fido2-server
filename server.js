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

    _.extend(this, opt);
}

FIDOServer.prototype.init = function() {
    console.log("Initializing ...");
    return new Promise(function(resolve, reject) {
        var modules = _.mapValues(this.modules, loadModule);
        var moduleNames = _.keys(modules);
        var promiseList = _.values(modules);

        Promise.all(promiseList)
            .then(function(res) {
                console.log("FIDO Server started.");
                var finalModules = _.zipObject(moduleNames, res);
                _.extend(this, finalModules);
                resolve(this);
            }.bind(this))
            .catch(function(err) {
                reject(err);
            }.bind(this));
    }.bind(this));
};

function loadModule(ext) {
    var module, Module, ret;
    if (typeof ext === "string") {
        console.log("Loading " + ext + " ...");
        Module = require(ext);
        module = new Module();
        // return a promise
        return module.init(this);
    }

    // either it's already a promise, 
    // or Promise will resolve it to whatever it already is
    return ext;
}

FIDOServer.prototype.shutdown = function() {
    return new Promise(function(resolve, reject) {
        console.log("FIDO Server shutting down ...");
        promiseList = _.invokeMap(this.modules, "shutdown");
        Promise.all(promiseList)
            .then(function(res) {
                console.log("Server shutdown successfully");
                return resolve(res);
            })
            .catch(function(err) {
                console.log("Error shutting down modules");
                console.log(err);
                return reject(err);
            });
    }.bind(this));
};

FIDOServer.prototype.getAttestationChallenge = function(userId, userInfo) {
    console.log ("blah");
    return new Promise(function(resolve, reject) {
        console.log ("getAttestationChallenge");
        // validate response
        if (typeof userId !== "string") {
            reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        var ret = {};
        // TODO: ret.accountInformation = {};
        ret.blacklist = this.blacklist;
        // TODO: ret.credentialExtensions = [];
        ret.cryptoParameters = [];
        ret.attestationChallenge = crypto.randomBytes(256).toString("hex");

        // TODO: is this a bad idea?
        console.log ("creating user");
        this.account.findOrCreateUser(userId, userInfo)
            .then(function(user) {
                console.log("created user:", user);

                // lookup user and save challenge for future reference
                return this.account.updateUserAttestation(userId, ret.attestationChallenge);
            }.bind(this))
            .then(function(user) {
                console.log("updated user:", user);
                return resolve(ret);
            }.bind(this))
            .catch(function(err) {
                console.log ("Error in getAttestationChallenge");
                console.log (err);
                reject (err);
            }.bind(this));
    }.bind(this));
};

FIDOServer.prototype.makeCredentialResponse = function(userId, res) {
    return new Promise(function(resolve, reject) {
        console.log(userId);
        console.log(res);

        // validate response
        if (typeof userId !== "string") {
            reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        if (typeof res !== "object") {
            reject(new TypeError("makeCredentialResponse: expected response to be a object"));
        }

        if (typeof res.credential !== "object" ||
            typeof res.credential.type !== "string" ||
            typeof res.credential.id !== "string") {
            reject(new TypeError("makeCredentialResponse: got an unexpected credential format"));
        }

        if (typeof res.publicKey !== "object") {
            reject(new TypeError("makeCredentialResponse: got an unexpected publicKey format"));
        }

        // TODO: validate public key based on key type

        // TODO: handle attestations
        console.log("Attestation:", res.attestation);
        if (typeof res.attestation !== null) {
            reject(new TypeError("makeCredentialResponse: attestations not currently handled"));
        }

        // save key and credential with account information
        this.account.getUserById(userId)
            .then(function(user) {
                console.log("user");
                console.log("First name:", user.firstName);
                console.log("Last name:", user.lastName);
                console.log("User ID:", user.id);
                console.log("User GUID:", user.guid);
                resolve(null);
            })
            .catch(function(err) {
                console.log("makeCredentialResponse error finding user");
                reject(err);
            });

    }.bind(this));
};

FIDOServer.prototype.getAssertionChallenge = function(userId) {
    return new Promise(function(resolve, reject) {
        var ret = {};
        // ret.sessionId = 
        // ret.assertionChallenge = 
        // ret.whitelist =
        // ret.assertionExtensions =

        resolve(ret);
    }.bind(this));
};

FIDOServer.prototype.getAssertionResponse = function(userId, res) {
    return new Promise(function(resolve, reject) {
        console.log(res);
        console.log(ctx);
        // res.credential = 
        // res.clientData =
        // res.authenticatorData =
        // res.signature = 

        resolve(null);
    }.bind(this));
};