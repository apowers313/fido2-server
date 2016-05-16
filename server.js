var _ = require("lodash");
var crypto = require("crypto");
var async = require("async");
var conf = require("rc");

module.exports = FIDOServer;

function FIDOServerError(message, type) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = type;
}
require('util').inherits(FIDOServerError, Error);

/**
 * Constructor for FIDO Server
 */
function FIDOServer(opt) {
    opt = opt || {};

    var defaults = {
        rpid: "example.com", // TLD + 1
        blacklist: [],
        cryptoParameterPrefs: [],
        challengeSize: 32,
        attestationTimeout: 300, // 5 minutes
        assertionTimeout: 300, // 5 minutes
        version: {
            major: 0,
            minor: 8,
            patch: 0
        },
        modules: {
            audit: "./audit.js",
            comm: "./comm.js",
            riskEngine: "./riskengine.js",
            metadataManager: "./metadatamanager.js",
            extension: "./extension.js",
            account: "./account.js",
        },
        moduleConfig: {
            // audit: {},
            // comm: {},
            // ...
        }
    };

    // use 'rc' for reading options out of config files
    // var conf = require("rc")("fidoserver", defaults);
    var conf = defaults;
    // opts:
    // - server rpid
    // - server SSL cert
    // - audit file
    // - audit stdout
    // - audit level
    // - audit app name
    // - account waterline orm adapter

    // TODO: validate options

    _.defaultsDeep(opt, conf);
    // TODO: copying options to the base object is getting messy, need to reorganize
    _.extend(this, opt);

    this.FIDOServerError = FIDOServerError;
}

/**
 * Initializes FIDO Server and all submodules
 */
FIDOServer.prototype.init = function() {
    console.log("Initializing ...");
    var loadModule = _loadModule.bind(this);
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

/*
 * Helper function for loading modules
 */
function _loadModule(ext, name) {
    var module, Module, ret;
    if (typeof ext === "string") {
        console.log("Loading " + name + " (" + ext + ") ...");
        Module = require(ext);
        module = new Module(this.moduleConfig[name]);
        // return a promise
        return module.init(this);
    }

    if (typeof ext !== "object" ||
        typeof ext.init !== "function") {
        return Promise.reject(new TypeError("expected module with init() method in loadModule"));
    }

    console.log("Loading " + name + " ...");
    return ext.init(this);
}

/**
 * Terminates FIDO Server and all submodules
 */
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

/**
 * Gets a challenge and any other parameters for the makeCredential call
 */
FIDOServer.prototype.getAttestationChallenge = function(userId) {
    return new Promise(function(resolve, reject) {
        console.log("getAttestationChallenge");
        // validate response
        if (typeof userId !== "string") {
            reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        var challenge = {};
        // TODO: ret.accountInformation = {};
        challenge.blacklist = this.blacklist;
        // TODO: ret.credentialExtensions = [];
        challenge.cryptoParameters = [];
        challenge.attestationChallenge = crypto.randomBytes(this.challengeSize).toString("hex");
        challenge.timeout = this.attestationTimeout;

        console.log("find user:", userId);
        // TODO: I think that this could be optimized by skipping the "getUserById" call
        this.account.getUserById(userId)
            .then(function(user) {
                console.log("found user:", user);
                if (user === undefined) {
                    reject(new FIDOServerError("User not found", "UserNotFound"));
                }

                // lookup user and save challenge for future reference
                return this.account.updateUserChallenge(userId, challenge.attestationChallenge);
            }.bind(this))
            .then(function(user) {
                console.log("updated user:", user);
                return resolve(challenge);
            }.bind(this))
            .catch(function(err) {
                console.log("Error in updateUserChallenge");
                console.log(err);
                return reject(err);
            }.bind(this));
    }.bind(this));
};

/**
 * Processes the makeCredential response
 */
FIDOServer.prototype.makeCredentialResponse = function(userId, res) {
    return new Promise(function(resolve, reject) {
        console.log(userId);
        console.log(res);

        // validate response
        if (typeof userId !== "string") {
            return reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        if (typeof res !== "object") {
            return reject(new TypeError("makeCredentialResponse: expected response to be a object"));
        }

        if (typeof res.credential !== "object" ||
            typeof res.credential.type !== "string" ||
            typeof res.credential.id !== "string") {
            return reject(new TypeError("makeCredentialResponse: got an unexpected credential format"));
        }

        if (typeof res.publicKey !== "object") {
            return reject(new TypeError("makeCredentialResponse: got an unexpected publicKey format"));
        }

        // TODO: validate public key based on key type
        // TODO: verify that publicKey.alg is an algorithm type supported by server

        // TODO: validate attestations
        console.log("Attestation:", res.attestation);
        if (res.attestation !== null) {
            return reject(new TypeError("makeCredentialResponse: attestations not currently handled"));
        }

        // save key and credential with account information
        this.account.getUserById(userId)
            .then(function(user) {
                console.log("makeCredentialResponse User:", user);
                if (user === undefined) {
                    return reject(new FIDOServerError("User not found", "UserNotFound"));
                }
                // TODO:
                // - make sure attestation matches
                // - lastAttestationUpdate must be somewhat recent (per some definable policy)
                // -- timeout for lastAttestationUpdate may be tied to the timeout parameter of makeCredential
                // - save credential
                // TODO: riskengine.evaluate
                return this.account.createCredential(userId, res);
            }.bind(this))
            .then(function(cred) {
                console.log("makeCredentialResponse Cred:", cred);
                if (cred === undefined) {
                    return reject(new Error("couldn't create credential"));
                }
                console.log("created credential:", cred);
                resolve(cred);
            })
            .catch(function(err) {
                console.log("makeCredentialResponse error:", err);
                reject(err);
            });

    }.bind(this));
};

/**
 * Creates an assertion challenge and any other parameters for the getAssertion call
 */
FIDOServer.prototype.getAssertionChallenge = function(userId) {
    return new Promise(function(resolve, reject) {
        console.log("getAssertionChallenge");
        // validate response
        if (typeof userId !== "string") {
            return reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        var ret = {};
        // TODO: ret.assertionExtensions = [];
        ret.assertionChallenge = crypto.randomBytes(this.challengeSize).toString("hex");
        ret.timeout = this.assertionTimeout;
        // lookup credentials for whitelist
        console.log("Getting user");
        this.account.updateUserChallenge(userId, ret.assertionChallenge)
            .then(function(user) {
                // updateUserChallenge doesn't populate credentials so we have to re-lookup here
                return this.account.getUserById (userId);
            })
            .then(function(user) {
                console.log("getAssertionChallenge user:", user);
                ret.whitelist = _.map(user.credentials, function(o) {
                    return _.pick(o, ["type", "id"]);
                });
                console.log ("getAssertionChallenge returning:", ret);
                resolve(ret);
            })
            .catch(function(err) {
                console.log ("ERROR:");
                console.log (err);
                reject(err);
            });

    }.bind(this));
};

/**
 * Processes a getAssertion response
 */
FIDOServer.prototype.getAssertionResponse = function(userId, res) {
    return new Promise(function(resolve, reject) {
        console.log("getAssertionResponse");
        // validate response
        if (typeof userId !== "string") {
            return reject(new TypeError("getAssertionResponse: expected userId to be a string"));
        }

        if (typeof res !== "object") {
            return reject(new TypeError("getAssertionResponse: expected response to be an object"));
        }

        if (typeof res.credential !== "object" ||
            typeof res.credential.type !== "string" ||
            typeof res.credential.id !== "string") {
            return reject(new TypeError("getAssertionResponse: got an unexpected credential format"));
        }

        if (typeof res.clientData !== "string") {
            return reject(new TypeError("getAssertionResponse: got an unexpected clientData format"));
        }

        // TODO: clientData must contain challenge, facet, hashAlg

        if (typeof res.authenticatorData !== "string") {
            return reject(new TypeError("getAssertionResponse: got an unexpected authenticatorData format"));
        }

        if (typeof res.signature !== "string") {
            return reject(new TypeError("getAssertionResponse: got an unexpected signature format"));
        }

        console.log(res);
        console.log("Getting user");
        this.account.getUserById(userId)
            .then(function(user) {
                if (typeof user !== "object") {
                    return reject(new TypeError("User not found: " + userId));
                }
                console.log("getAssertionChallenge user:", user);
                if (user.challenge === undefined || 
                    user.lastChallengeUpdate === undefined) {
                    return reject(new TypeError("Challenge not found"));
                }
                console.log(user.challenge);
                console.log(user.lastChallengeUpdate);
                // TODO: if now() > user.lastChallengeUpdate + this.assertionTimeout, reject()
                // TODO: if res.challenge !== user.challenge, reject()
                // TODO: hash data & verify signature
                // publicKey.alg = RSA256, ES256, PS256, ED256
                // crypto.createVerify('RSA-SHA256');
                // jwkToPem(); 
                // TODO: verify tokenBinding, if it exists
                // TODO: process extensions
                // TODO: riskengine.evaluate
                var ret = {
                    userId: userId,
                    credential: res.credential,
                    valid: true
                };
                resolve(ret);
            })
            .catch(function(err) {
                reject(err);
            });
    }.bind(this));
};