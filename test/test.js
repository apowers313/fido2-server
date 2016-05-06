var assert = require("chai").assert;
var FIDOServer = require("../server.js");
var helpers = require("./helpers/helpers.js");

describe("basic tests", function() {
	it("gets makeCredential parameters", function(done) {
		var s = new FIDOServer();
		assert.equal(s.rpid, "example.com");
		s.makeCredentialParms(function(err, params) {
			assert.isNull(err);
			assert.isDefined(params);
			assert.isDefined(params.attestationChallenge);
			assert.lengthOf(params.attestationChallenge, 512);
			done();
		});
	});

	it("get makeCredentialResponse", function(done) {
		var s = new FIDOServer();
		s.makeCredentialResponse(helpers.validMakeCredential, null, function(err, res) {
			assert.isNull(err);
			done();
		});
	});

	it("get getAssertionParams", function(done) {
		var s = new FIDOServer();
		s.getAssertionParams(function(err, res) {
			assert.isNull(err);
			done();
		});
	});

	it("get getAssertionResponse", function(done) {
		var s = new FIDOServer();
		s.getAssertionResponse(helpers.validGetAssertion, null, function(err, res) {
			assert.isNull(err);
			done();
		});
	});
});

describe.only("logging tests", function() {
	it("logs", function() {
		return new FIDOServer().init().then(function(s) {
			console.log ("!!!! SERVER CALLBACK");
			s.audit.fatal("fatal");
			s.audit.error("error");
			s.audit.error(new TypeError("type error"));
			s.audit.warn("warn");
			s.audit.info("info");
			s.audit.debug("debug");
			s.audit.trace("trace");
		});
	});
});

describe("account management", function() {
	it("creates account", function() {
		var s = new FIDOServer();
	});
});

describe("fuzzing tests", function() {
	it("fuzzes new server options");
	it("fuzzes makeCredential response");
	it("fuzzes getAttestation response");
});

describe("security tests", function() {
	it("bad signature");
});

describe("multi-user", function() {
	it("doesn't get confused by multiple simultaneous authentications");
	it("doesn't get confused by multiple simultaneous registrations");
});

describe("load testing", function() {
	it("can handle 100 simultaneous users making requests");
});