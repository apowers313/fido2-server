var assert = require("chai").assert;
var FIDOServer = require("../server.js");

describe ("basic tests", function() {
	it("gets makeCredential parameters", function(done) {
		var s = new FIDOServer();
		assert.equal (s.rpid, "example.com");
		s.makeCredentialParms (function (err, params) {
			assert.isNull (err);
			assert.isDefined (params);
			assert.isDefined (params.attestationChallenge);
			assert.lengthOf (params.attestationChallenge, 512);
			done();
		});
	});

	it("get makeCredentialResponse", function(done) {
		var s = new FIDOServer();
		s.makeCredentialResponse ({}, {}, function (err, res) {
			assert.isNull (err);
			done();
		});
	});

	it("get getAssertionParams", function(done) {
		var s = new FIDOServer();
		s.getAssertionParams(function (err, res) {
			assert.isNull (err);
			done();
		});
	});

	it ("get getAssertionResponse", function(done) {
		var s = new FIDOServer();
		s.getAssertionResponse ({}, {}, function (err, res) {
			assert.isNull (err);
			done();
		});
	});
});

describe ("security tests", function() {
	it("bad signature");
});

describe ("multi-user", function() {
	it("doesn't get confused by multiple simultaneous authentications");
	it("doesn't get confused by multiple simultaneous registrations");
});