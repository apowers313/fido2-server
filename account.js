var Waterline = require("waterline");
var sailsMemoryAdapter = require("sails-memory");
var async = require("async");
var uuid = require("node-uuid");

module.exports = ServerAccount;

function ServerAccount(opts, cb) {
}

ServerAccount.prototype.init = function(server) {
	return new Promise(function(resolve, reject) {
		var waterline = new Waterline();

		var waterlineConfig = {
			adapters: {
				"memory": sailsMemoryAdapter
			},

			connections: {
				default: {
					adapter: "memory"
				}
			}
		};

		var userCollection = Waterline.Collection.extend({
			identity: "user",
			connection: "default",
			attributes: { // TODO
				firstName: "string",
				lastName: "string",
				email: {
					type: "string",
					unique: true,
					required: true	
				},
				id: {
					type: "text",
					primaryKey: true,
					unique: true,
					defaultsTo: function() {
						return uuid.v4();
					}
				},
				imageUrl: "string",
				otherInfo: "json",

				// Add a reference to Pets
				credentials: {
					collection: "credential",
					via: "user"
				}
			}
		});

		var credentialCollection = Waterline.Collection.extend({
			identity: "credential",
			connection: "default",
			attributes: {
				type: "string",
				id: {
					type: "integer",
					autoIncrement: true,
					unique: true,
					primaryKey: true,
					required: true,
					index: true
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

			return resolve(this);
		}.bind(this));
	}.bind(this));
};

ServerAccount.prototype.shutdown = function() {
	return new Promise (function (resolve, reject) {
		this.waterline.teardown(function(err, res) {
			if (err) {
				console.log ("Waterline shutdown failed");
				reject (err);
			}

			resolve (res);
		});
	}.bind(this));
};

ServerAccount.prototype.listUsers = function() {
	return this.user.find().populate("credentials");
};

ServerAccount.prototype.createUser = function(email, firstName, lastName, otherInfo) {
	if (typeof email !== "string") {
		return Promise.reject(new TypeError ("email required when creating user"));
	}
	var user = {
		email: email,
		firstName: firstName,
		lastName: lastName,
		otherInfo: otherInfo
	}
	return this.user.create(user);
};

ServerAccount.prototype.getUserById = function(id) {
	return this.user.findOne().where({id: id}).populate("credentials");
};

ServerAccount.prototype.getUserByEmail = function(email) {
	return this.user.findOne().where({email: email}).populate("credentials");
};


ServerAccount.prototype.updateUser = function() {

};

ServerAccount.prototype.deleteUser = function() {

};

ServerAccount.prototype.listCredentials = function() {

};

ServerAccount.prototype.createCredential = function() {

};

ServerAccount.prototype.getCredential = function() {

};

ServerAccount.prototype.updateCredential = function() {

};

ServerAccount.prototype.deleteCredential = function() {

};