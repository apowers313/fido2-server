var Waterline = require("waterline");
var sailsMemoryAdapter = require("sails-memory");
var async = require("async");
var uuid = require('node-uuid');

module.exports = ServerAccount;

function ServerAccount(opts, cb) {
	console.log("new server account");

	// waterLineInit(cb);

	console.log("ServerAccount constructor done");
}

ServerAccount.prototype.init = function() {
	return Promise.resolve (null);
};

ServerAccount.prototype.shutdown = function() {
	return Promise.resolve (null);
};

function waterLineInit(cb) {
	var waterline = new Waterline();
	console.log("waterline init");

	var waterlineConfig = {
		adapters: {
			'memory': sailsMemoryAdapter
		},

		connections: {
			default: {
				adapter: 'memory'
			}
		}
	};

	var userCollection = Waterline.Collection.extend({
		identity: 'user',
		connection: 'default',
		attributes: { // TODO
			firstName: 'string',
			lastName: 'string',
			email: 'string',
			id: {
				type: 'text',
				primaryKey: true,
				unique: true,
				defaultsTo: function() {
					return uuid.v4();
				}
			},
			imageUrl: 'string',

			// Add a reference to Pets
			credentials: {
				collection: 'credential',
				via: 'user'
			}
		}
	});

	var credentialCollection = Waterline.Collection.extend({
		identity: 'credential',
		connection: 'default',
		attributes: {
			type: 'string',
			id: {
				type: 'integer',
				autoIncrement: true,
				unique: true,
				primaryKey: true,
				required: true,
				index: true
			},

			// Add a reference to User
			user: {
				model: 'user'
			}
		}
	});

	waterline.loadCollection(userCollection);
	waterline.loadCollection(credentialCollection);

	console.log("doing init...");
	waterline.initialize(waterlineConfig, function(err, ontology) {
		console.log("init done...");
		var ret = {};

		if (err) {
			console.log("Error in waterline init: " + err);
			// TODO: audit warn
			cb(err);
		}

		ret.waterline = waterline;
		ret.user = ontology.collections.user;
		ret.credential = ontology.collections.credential;

		console.log("waterline init done");

		return cb(null, ret);
	});
}

ServerAccount.prototype.listUsers = function() {

};

ServerAccount.prototype.createUser = function() {

};

ServerAccount.prototype.getUser = function() {

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