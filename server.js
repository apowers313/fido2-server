var crypto = require ("crypto");
var ServerComm = require ("./comm.js");
var ServerAudit = require ("./audit.js");
var ServerRiskEngine = require ("./riskengine.js");
var ServerMdsClient = require ("./mdsclient.js");
var ServerExtension = require ("./extension.js");

module.exports = FIDOServer;

function FIDOServer(opts) {
	opts = opts || {};
	this.rpid = "example.com"; // TLD + 1
	// this.cryptoParameterPrefs = [];
	// this.blacklist = [];
	this.audit = opts.audit || new ServerAudit();
	this.comm = opts.comm || new ServerComm();
	this.riskEngine = opts.riskEngine || new ServerRiskEngine();
	this.mdsClient = opts.mdsClient || new ServerMdsClient();
	this.fidoExtension = opts.extension || new ServerExtension();
}

FIDOServer.prototype.makeCredentialParms = function(cb) {
	var ret = {};
	// ret.accountInformation = {};
	// ret.sessionId = 
	// ret.blacklist = [];
	// ret.credentialExtensions = [];
	ret.cryptoParameters = [];
	ret.attestationChallenge = crypto.randomBytes(256).toString ("hex");

	cb (null, ret);
};

FIDOServer.prototype.makeCredentialResponse = function(res, ctx, cb) {
	// res.credential
	// res.publicKey
	// res.attestation

	cb (null, null);
};

FIDOServer.prototype.getAssertionParams = function(cb) {
	var ret = {};
	// ret.sessionId = 
	// ret.assertionChallenge = 
	// ret.whitelist =
	// ret.assertionExtensions =

	cb (null, ret);
};

FIDOServer.prototype.getAssertionResponse = function(res, ctx, cb) {
	// res.credential = 
	// res.clientData =
	// res.authenticatorData =
	// res.signature = 

	cb (null, null);
};