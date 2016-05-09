var _ = require("lodash");
var crypto = require("crypto");
var async = require("async");

module.exports = FIDOServer;

/**
 * Constructor for FIDO Server
 */
function FIDOServer(opt) {
    opt = opt || {};

    var defaults = {
        rpid: "example.com", // TLD + 1
        blacklist: [],
        cryptoParameterPrefs: [],
        attestationSize: 32,
        attestationTimeout: 300, // 5 minutes
        assertionTimeout: 300, // 5 minutes
        modules: {
            audit: "./audit.js",
            comm: "./comm.js",
            riskEngine: "./riskengine.js",
            metadataManager: "./metadatamanager.js",
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

/**
 * Initializes FIDO Server and all submodules
 */
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

/*
 * Helper function for loading modules
 */
function loadModule(ext) {
    var module, Module, ret;
    if (typeof ext === "string") {
        console.log("Loading " + ext + " ...");
        Module = require(ext);
        module = new Module();
        // return a promise
        return module.init(this);
    }

    if (typeof ext !== "object" ||
        typeof ext.init !== "function") {
        return Promise.reject(new TypeError("expected module with init() method in loadModule"));
    }
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
    console.log("blah");
    return new Promise(function(resolve, reject) {
        console.log("getAttestationChallenge");
        // validate response
        if (typeof userId !== "string") {
            reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        var ret = {};
        // TODO: ret.accountInformation = {};
        ret.blacklist = this.blacklist;
        // TODO: ret.credentialExtensions = [];
        ret.cryptoParameters = [];
        ret.attestationChallenge = crypto.randomBytes(this.attestationSize).toString("hex");
        ret.timeout = this.attestationTimeout;

        console.log("find user:", userId);
        // TODO: I think that this could be optimized by skipping the "getUserById" call
        this.account.getUserById(userId)
            .then(function(user) {
                console.log("found user:", user);
                if (user === undefined) {
                    reject(new Error("User not found"));
                }

                // lookup user and save challenge for future reference
                return this.account.updateUserAttestation(userId, ret.attestationChallenge);
            }.bind(this))
            .then(function(user) {
                console.log("updated user:", user);
                return resolve(ret);
            }.bind(this))
            .catch(function(err) {
                console.log("Error in getAttestationChallenge");
                console.log(err);
                reject(err);
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
        // TODO: verify that publicKey.alg is an algorithm type supported by server

        // TODO: validate attestations
        console.log("Attestation:", res.attestation);
        if (res.attestation !== null) {
            reject(new TypeError("makeCredentialResponse: attestations not currently handled"));
        }

        // save key and credential with account information
        this.account.getUserById(userId)
            .then(function(user) {
                // TODO:
                // - make sure attestation matches
                // - lastAttestationUpdate must be somewhat recent (per some definable policy)
                // -- timeout for lastAttestationUpdate may be tied to the timeout parameter of makeCredential
                // - save credential
                // TODO: riskengine.evaluate
                return this.account.createCredential(userId, res);
            }.bind(this))
            .then(function(cred) {
                console.log("created credential:", cred);
                resolve(cred);
            })
            .catch(function(err) {
                console.log("makeCredentialResponse error finding user");
                reject(err);
            });

    }.bind(this));
};

/**
 * Creates an assertion challenge and any other parameters for the getAssertion call
 */
FIDOServer.prototype.getAssertionChallenge = function(userId) {
    return new Promise(function(resolve, reject) {
        console.log("!!!! getAssertionChallenge");
        // validate response
        if (typeof userId !== "string") {
            reject(new TypeError("makeCredentialResponse: expected userId to be a string"));
        }

        var ret = {};
        // TODO: ret.assertionExtensions = [];
        ret.assertionChallenge = crypto.randomBytes(this.attestationSize).toString("hex");
        ret.timeout = this.assertionTimeout;
        // lookup credentials for whitelist
        console.log("Getting user");
        this.account.getUserById(userId)
            .then(function(user) {
                console.log("getAssertionChallenge user:", user);
                ret.whitelist = _.map(user.credentials, function(o) {
                    return _.pick(o, ["type", "id"]);
                });
                resolve(ret);
            })
            .catch(function(err) {
                reject(err);
            });

    }.bind(this));
};

/**
 * Processes a getAssertion response
 */
FIDOServer.prototype.getAssertionResponse = function(userId, res) {
    return new Promise(function(resolve, reject) {
        console.log ("getAssertionResponse");
        // validate response
        if (typeof userId !== "string") {
            reject(new TypeError("getAssertionResponse: expected userId to be a string"));
        }

        if (typeof res !== "object") {
            reject(new TypeError("getAssertionResponse: expected response to be an object"));
        }

        if (typeof res.credential !== "object" ||
            typeof res.credential.type !== "string" ||
            typeof res.credential.id !== "string") {
            reject(new TypeError("getAssertionResponse: got an unexpected credential format"));
        }

        if (typeof res.clientData !== "string") {
            reject(new TypeError("getAssertionResponse: got an unexpected clientData format"));
        }

        // TODO: clientData must contain challenge, facet, hashAlg

        if (typeof res.authenticatorData !== "string") {
            reject(new TypeError("getAssertionResponse: got an unexpected authenticatorData format"));
        }

        if (typeof res.signature !== "string") {
            reject(new TypeError("getAssertionResponse: got an unexpected signature format"));
        }

        console.log (res);
        console.log("Getting user");
        this.account.getUserById(userId)
            .then(function(user) {
                console.log("getAssertionChallenge user:", user);
                console.log (user.attestation);
                console.log (user.lastAttestationUpdate);
                // TODO: if now() > user.lastAttestationUpdate + this.assertionTimeout, reject()
                // TODO: if res.attestation !== user.attestation, reject()
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
                resolve (ret);
            })
            .catch(function(err) {
                reject(err);
            });
    }.bind(this));
};