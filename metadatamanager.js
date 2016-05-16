var _ = require("lodash");

module.exports = MetadataManager;

// TODO: handle side-loading certs / metadata

/**
 * Manages loading metadata and attestation certs for authenticators 
 * through the Metadata Service (MDS) and through JSON statments stored 
 * in a watch folder.
 */
function MetadataManager(opt) {
	opt = _.cloneDeep(opt);
	var defaults = {
		waterlineAdapter: "sails-memory",
		metadataDir: "./metadata",
		mdsUrl: "https://mds.fidoalliance.org"
	};
	opt = _.defaultsDeep(opt, defaults);

	this.opt = opt;
}

MetadataManager.prototype.init = function(server) {
	return Promise.resolve(null);
	// return new Promise(function(resolve, reject) {
	// 	return waterlineInit.call(this)
	// 		.then(function(waterline) {
	// 			// TODO: "chokidar" watch on watch folder
	// 			return this.update();
	// 		}.bind(this));
	// }.bind(this));
};

function waterlineInit() {
	return new Promise(function(resolve, reject) {

		// init waterline
		var Waterline = require("waterline");
		var waterline = new Waterline();
		var adapter = require(this.opt.waterlineAdapter);
		var waterlineConfig = {
			adapters: {
				"default": adapter
			},

			connections: {
				default: {
					adapter: "default"
				}
			}
		};

		// setup waterline models
		var configCollection = Waterline.Collection.extend({
			identity: "config",
			connection: "default",
			attributes: {
				lastUpdate: "datetime",
				nextUpdate: "date"
			}
		});

		var authenticatorCollection = Waterline.Collection.extend({
			identity: "authenticator",
			connection: "default",
			attributes: {
				// TODO: should mirror metadata specification
				id: "string", // unique, index
				report: "string",
				certified: "boolean",
				metadata: "json"
			}
		});

		// TODO: load authentictors, config data from waterline
		waterline.loadCollection(configCollection);
		waterline.loadCollection(authenticatorCollection);

		waterline.initialize(waterlineConfig, function(err, ontology) {
			if (err) {
				console.log("Error in waterline init: " + err);
				// TODO: audit warn
				return reject(err);
			}

			this.waterline = waterline;
			this.config = ontology.collections.config;
			this.authenticator = ontology.collections.authenticator;

			return resolve(this);
		}.bind(this));
	}.bind(this));
}

MetadataManager.prototype.shutdown = function() {
	return Promise.resolve(null);
};

MetadataManager.prototype.update = function() {
	// TODO: "chokidar" update from watch directory
	// TODO: check next update time; if it's past then update
	return Promise.resolve(null);
};

function updateMds() {

}

function updateWatchFolder() {

}

MetadataManager.prototype.listAuthenticators = function() {
	return Promise.resolve([]);
};

MetadataManager.prototype.createAuthenticator = function() {
	return Promise.resolve(null);
}

MetadataManager.prototype.getAuthenticatorById = function() {
	return Promise.resolve(null);
};

MetadataManager.prototype.updateAuthenticator = function() {
	return Promise.resolve(null);
}

MetadataManager.prototype.deleteAuthenticator = function() {
	return Promise.resolve(null);
}

MetadataManager.prototype.getConfig = function() {
	return Promise.resolve(null);
}