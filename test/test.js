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

	it.skip("gets getAttestationChallenge", function(done) {
		assert.equal(server.rpid, "example.com");
		console.log("doing getAttestationChallenge");
		return server.account.createUser(helpers.userId, helpers.sampleUserInfo)
			.then(function(user) {
				console.log("created user:", user);
				return server.getAttestationChallenge(helpers.userId);
			})
			.then(function(info) {
				console.log("getAttestationChallenge");
				assert.isDefined(info);
				assert.isDefined(info.attestationChallenge);
				assert.lengthOf(info.attestationChallenge, 512);
				done();
			}.bind(this));
	});

	it.skip("get makeCredentialResponse", function() {
		return server.account.createUser(helpers.userId, helpers.sampleUserInfo)
			.then(function(user) {
				console.log("created user:", user);
				return server.getAttestationChallenge(helpers.userId);
			})
			.then(function(info) {
				console.log("getAttestationChallenge done");
				return server.makeCredentialResponse(helpers.userId, helpers.validMakeCredential);
			})
			.then(function(res) {
				console.log("makeCredentialResponse done");
				console.log(res);
				return null;
			});
	});

	it.skip("get getAssertionChallenge", function() {
		return server.account.createUser(helpers.userId, helpers.sampleUserInfo)
			.then(function(user) {
				console.log("created user:", user);
				return server.getAttestationChallenge(helpers.userId);
			})
			.then(function(info) {
				console.log("getAttestationChallenge done");
				return server.makeCredentialResponse(helpers.userId, helpers.validMakeCredential);
			})
			.then(function(res) {
				console.log("makeCredentialResponse done");
				console.log(res);
				console.log("!!! DOING OUR BIG THING");
				return server.getAssertionChallenge(helpers.userId);
			})
			.then(function(res) {
				console.log("Final assertion challenge:", res);
				return res;
			});
	});

	it.only("get getAssertionResponse", function() {
		return server.account.createUser(helpers.userId, helpers.sampleUserInfo)
			.then(function(user) {
				console.log("created user:", user);
				return server.getAttestationChallenge(helpers.userId);
			})
			.then(function(info) {
				console.log("getAttestationChallenge done");
				return server.makeCredentialResponse(helpers.userId, helpers.validMakeCredential);
			})
			.then(function(res) {
				console.log("makeCredentialResponse done");
				console.log(res);
				console.log("!!! DOING OUR BIG THING");
				return server.getAssertionChallenge(helpers.userId);
			})
			.then(function(res) {
				console.log("Final assertion challenge:", res);
				return server.getAssertionResponse(helpers.userId, helpers.validGetAssertion);
			})
			.then(function(assn) {
				console.log("assertion:", assn);
				return assn;
			});
	});

	it("getAttestationChallenge user not found");
	it("makeCredentialResponse user not found");
	it("getAssertionChallenge user not found");
	it("getAssertionResponse user not found");
	it("getAssertionResponse bad challenge");
	it("makeCredentialResponse bad challenge");
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
			s.account.createUser("adam@fidoalliance.org", {
				firstName: "Adam",
				lastName: "Powers"
			}).then(function(createdUser) {
				console.log("created user:", createdUser);
				s.account.getUserById("adam@fidoalliance.org").then(function(foundUser) {
					console.log("found user:", foundUser);
					// can't do deep-equal, since other attributes are added behind the scenes
					assert.equal(createdUser.firstName, "Adam");
					assert.equal(createdUser.lastName, "Powers");
					assert.equal(createdUser.id, "adam@fidoalliance.org");
					assert.equal(createdUser.guid, foundUser.guid);
					assert.equal(foundUser.firstName, createdUser.firstName);
					assert.equal(foundUser.lastName, createdUser.lastName);
					assert.equal(foundUser.id, createdUser.id);
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