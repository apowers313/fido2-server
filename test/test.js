var assert = require("chai").assert;
var FIDOServer = require("../server.js");
var helpers = require("./helpers/helpers.js");

describe.only("basic tests", function(done) {
	var server;
	this.timeout(10000);

	beforeEach(function(done) {
		new FIDOServer().init().then(function(s) {
			server = s;
			console.log("beforeEach: done creating server");
			done();
		});
	});

	afterEach(function(done) {
		server.shutdown().then(function() {
			console.log("afterEach: done shutting down server");
			done();
		});
	});

	it.only("gets makeCredential parameters", function() {
		assert.equal(server.rpid, "example.com");
		return server.serverInfo().then(function(info) {
			assert.isDefined(info);
			assert.isDefined(info.attestationChallenge);
			assert.lengthOf(info.attestationChallenge, 512);
		});
	});

	it.skip("get makeCredentialResponse", function(done) {
		new FIDOServer().init().then(function(server) {
			server.makeCredentialResponse(helpers.validMakeCredential, null, function(err, res) {
				assert.isNull(err);
				done();
			});
		});
	});

	it.skip("get getAssertionParams", function(done) {
		new FIDOServer().init().then(function(server) {
			server.getAssertionParams(function(err, res) {
				assert.isNull(err);
				done();
			});
		});
	});

	it.skip("get getAssertionResponse", function(done) {
		new FIDOServer().init().then(function(server) {
			server.getAssertionResponse(helpers.validGetAssertion, null, function(err, res) {
				assert.isNull(err);
				done();
			});
		});
	});
});

describe("logging tests", function() {
	it("logs", function() {
		return new FIDOServer().init().then(function(s) {
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
	it("creates and finds user", function(done) {
		return new FIDOServer().init().then(function(s) {
			console.log(s.account.name);
			// s.account.listUsers().then(function(users) {});
			s.account.createUser("adam@fidoalliance.org", "Adam", "Powers").then(function(createdUser) {
				console.log("created user:", createdUser);
				s.account.getUserByEmail("adam@fidoalliance.org").then(function(foundUser) {
					console.log("found user:", foundUser);
					// can't do deep-equal, since other attributes are added behind the scenes
					assert.equal(createdUser.firstName, "Adam");
					assert.equal(createdUser.lastName, "Powers");
					assert.equal(createdUser.email, "adam@fidoalliance.org");
					assert.equal(createdUser.id, foundUser.id);
					assert.equal(foundUser.firstName, createdUser.firstName);
					assert.equal(foundUser.lastName, createdUser.lastName);
					assert.equal(foundUser.email, createdUser.email);
					done();
				});
			});
		});
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