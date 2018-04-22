var _ = require("lodash");
var async = require("async");
var uuid = require("uuid");

module.exports = ServerAccount;

// TODO: change name to "IdentityStore"?

/**
 * CRUD operations for accounts and credentials, based on Waterline
 */
function ServerAccount(opt) {
	opt = _.cloneDeep(opt);
	var defaults = {
		waterlineAdapter: "sails-memory",
	};
	opt = _.defaultsDeep(opt, defaults);
	// TODO: verify options
	this.opt = opt;
}

ServerAccount.prototype.init = function(server) {
	return new Promise(function(resolve, reject) {
		var Waterline = require("waterline");
		var waterline = new Waterline();
		var adapter = require(this.opt.waterlineAdapter);

		var waterlineConfig = {
			adapters: {
				"acctDefault": adapter // TODO: use default
			},

			connections: {
				acct: {
					adapter: "acctDefault"
				}
			}
		};

		var userCollection = Waterline.Collection.extend({
			identity: "user",
			connection: "acct",
			attributes: {
				firstName: "string",
				lastName: "string",
				id: { // account name, email, etc.
					type: "string",
					primaryKey: true,
					unique: true,
					required: true,
					index: true
				},
				guid: {
					type: "text",
					unique: true,
					defaultsTo: function() {
						return uuid.v4();
					}
				},
				imageUrl: "string",
				challenge: "string",
				lastChallengeUpdate: "datetime",
				otherInfo: "json",

				credentials: {
					collection: "credential",
					via: "user"
				}
			},
			beforeUpdate: function(values, next) {
				console.log("updating:", values);
				if (values.challenge !== undefined) {
					values.lastChallengeUpdate = new Date();
				}
				console.log("updating:", values);
				next();
			}
		});

		var credentialCollection = Waterline.Collection.extend({
			identity: "credential",
			connection: "acct",
			attributes: {
				type: {
					type: "string",
					required: true
				},
				id: {
					type: "string",
					unique: true,
					primaryKey: true,
					required: true,
					index: true
				},
				publicKey: {
					type: "json",
					required: true
				},

				// Add a reference to User
				user: {
					model: "user"
				}
			}
		});

		waterline.loadCollection(userCollection);
		waterline.loadCollection(credentialCollection);

		waterline.initialize(waterlineConfig, function(err, ontology) {

			if (err) {
				console.log("Error in waterline init: " + err);
				// TODO: audit warn
				return reject(err);
			}

			this.waterline = waterline;
			this.user = ontology.collections.user;
			this.credential = ontology.collections.credential;

			console.log ("ACCOUNT DONE");
			return resolve(this);
		}.bind(this));
	}.bind(this));
};

ServerAccount.prototype.shutdown = function() {
	return new Promise(function(resolve, reject) {
		this.waterline.teardown(function(err, res) {
			if (err) {
				console.log("Waterline shutdown failed");
				reject(err);
			}

			resolve(res);
		});
	}.bind(this));
};

ServerAccount.prototype.listUsers = function() {
	return this.user.find().populate("credentials");
};

ServerAccount.prototype.createUser = function(id, userInfo) {
	console.log("createUser");
	if (typeof id !== "string") {
		return Promise.reject(new TypeError("id required when creating user"));
	}

	userInfo = userInfo || {};

	var user = {
		id: id,
		firstName: userInfo.firstName,
		lastName: userInfo.lastName,
		otherInfo: userInfo.otherInfo
	};
	console.log("createUser:", user);
	return this.user.create(user);
};

ServerAccount.prototype.getUserById = function(id) {
	return this.user
		.findOne()
		.where({
			id: id
		})
		.populate("credentials");
};

// TODO: remove this in favor of updateUserById
ServerAccount.prototype.updateUserChallenge = function(id, challenge) {
	if (typeof id !== "string") {
		return Promise.reject(new TypeError("updateUserChallenge expected id to be string"));
	}

	console.log(challenge);
	if (typeof challenge !== "string" ||
		challenge.length < 8) {
		return Promise.reject(new TypeError("updateUserChallenge expected challenge to be string at least 8 bytes long"));
	}

	return this.user
		.update({
			id: id
		}, {
			challenge: challenge
		});
};

ServerAccount.prototype.updateUser = function() {
	// TODO
};

ServerAccount.prototype.deleteUser = function() {
	// TODO
};

ServerAccount.prototype.listCredentials = function() {
	// TODO
};

ServerAccount.prototype.createCredential = function(userId, credential) {
	console.log("creating credential:", credential);
	if (typeof userId !== "string") {
		return Promise.reject(new TypeError("createCredential: expected id to be string"));
	}

	// assuming that more extensive checking has done before we got here, and by the waterline schema
	if (typeof credential !== "object") {
		reject(new TypeError("makeCredentialResponse: expected response to be a object"));
	}

	var cred = {
		type: credential.credential.type,
		id: credential.credential.id,
		publicKey: credential.publicKey,
		// TODO: attestation?
		user: userId
	};

	return this.credential.create(cred);
};

ServerAccount.prototype.getCredential = function() {
	// TODO
};

ServerAccount.prototype.updateCredential = function() {
	// TODO
};

ServerAccount.prototype.deleteCredential = function() {
	// TODO
};