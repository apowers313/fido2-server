var _ = require("lodash");
var MDSC = require("mds-client");

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
		waterlineAdapter: "sails-disk",
		metadataDir: "./metadata",
		mdsUrl: "https://mds.fidoalliance.org"
	};
	opt = _.defaultsDeep(opt, defaults);

	this.opt = opt;
}

MetadataManager.prototype.init = function(server) {
	return waterlineInit.call(this)
		.then(function(waterline) {
			// TODO: "chokidar" watch on watch folder
			return this.update();
		}.bind(this))
		.then(function(update) {
			return this;
		});
};

function waterlineInit() {
	return new Promise(function(resolve, reject) {

		// init waterline
		var Waterline = require("waterline");
		var waterline = new Waterline();
		var adapter = require(this.opt.waterlineAdapter);
		var waterlineConfig = {
			adapters: {
				"mmDefault": adapter
			},

			connections: {
				mm: {
					adapter: "mmDefault"
				}
			}
		};

		// setup waterline models
		var configCollection = Waterline.Collection.extend({
			identity: "config",
			connection: "mm",
			attributes: {
				lastMdsUpdate: "datetime",
				nextMdsUpdate: "date",
				serialNo: "integer"
			}
		});

		var authenticatorCollection = Waterline.Collection.extend({
			identity: "authenticator",
			connection: "mm",
			attributes: {
				// TODO: should mirror metadata specification
				id: "string", // required, unique, index
				aaid: "string",
				aaguid: "string",
				attestationCertificateKeyIdentifiers: "array",
				hash: "string",
				url: "string", // required, unique
				timeOfLastStatusChange: "date",
				statusReports: "json",
				// reportedHash: "string",
				// certified: "boolean",
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
	return new Promise(function(resolve, reject) {
		// TODO: "scandir" to update new / updated files from watch directory

		// TODO: check next update time; if it's past then update
		var updateMds = function() {
			return new Promise(function(resolve, reject) {
				var mdsClient = new MDSC();
				var toc;
				return mdsClient.fetchToc()
					// fetch MDS TOC
					.then(function(retToc) {
						// TODO: check return?
						toc = retToc;
						return this.getConfig();
					}.bind(this))
					// save config
					.then(function(c) {
						console.log(c);
						config = c || {};
						config.lastMdsUpdate = new Date();
						config.nextMdsUpdate = toc.nextUpdate;
						config.serialNo = toc.no;
						console.log(config);

						if (c === undefined) {
							return this.setConfig(config);
						} else {
							return this.updateConfig(config);
						}
						// return this.getConfig();
					}.bind(this))
					// fetch entries
					.then(function(config) {
						console.log("Got config");
						console.log(config);
						return mdsClient.fetchEntries();
					})
					// save / update all entries
					.then(function(entries) {
						// TODO: filter errors
						var i, id, p, promiseList = [];
						for (i = 0; i < entries.length; i++) {
							// console.log("Doing Entry:", entries[i]);
							// TODO: not sure this is the right algorithm for setting an ID
							entries[i].id = entries[i].aaid ||
								entries[i].aaguid ||
								entries[i].attestationCertificateKeyIdentifiers;
							console.log("Doing Entry ID:", entries[i].id);
							p = this.getAuthenticatorById(id)
								.then(function(authn) {
									// if (authn === undefined) {
									// 	console.log("ID not found:", entries[i].id);
									// 	return this.createAuthenticator(entries[i]);
									// } else {
									// 	console.log("ID found:", entries[i].id);
									// 	return this.updateAuthenticator(entries[i]);
									// }
									return authn;
								}.bind(this))
								.catch(function(err) {
									return err;
								});
							promiseList.push(p);
						}
						console.log("doing Promise.all");
						return Promise.all(promiseList);
					}.bind(this))
					.then(function(ps) {
						console.log("Promise.all done");
						console.log(ps);
						return resolve(true);
					})
					.catch(function(err) {
						console.log("ERROR IN UPDATE MDS");
						console.log(err);
						return reject(err);
					});
			}.bind(this));
		}.bind(this);

		// grab our config to see if we need to update
		this.getConfig().then(function(config) {
			// if we don't have a config entry, grab the MDS
			if (config === undefined) {
				updateMds()
					.then(function(res) {
						return resolve(res);
					})
					.catch(function(err) {
						console.log("ERR1");
						return reject(err);
					});
			}

			// if our MDS entry is stale, grab the latest one
			var now = new Date();
			var next = new Date(config.nextMdsUpdate);
			if (now.getTime() > next.getTime()) {
				updateMds()
					.then(function(res) {
						return resolve(res);
					})
					.catch(function(err) {
						console.log("ERR2");
						return reject(err);
					});
			}

			console.log("METADATA MANAGER DONE");
			return resolve(null);
		});
	}.bind(this));
};



function updateWatchFolder() {

}

MetadataManager.prototype.getConfig = function() {
	return this.config.find().then(function(configs) {
		if (configs.length > 1) {
			return Promise.reject(new Error("Too many configs found in database: " + configs.length));
		} else if (configs.length === 0) {
			return undefined;
		}
		return configs[0];
	});
};

MetadataManager.prototype.setConfig = function(config) {
	return this.config.create(config);
};

MetadataManager.prototype.updateConfig = function(config) {
	console.log("updating config");
	return this.config.update({}, config);
};

MetadataManager.prototype.listAuthenticators = function() {
	return Promise.resolve([]);
};

MetadataManager.prototype.createAuthenticator = function(authn) {
	return Promise.resolve(null);
};

MetadataManager.prototype.getAuthenticatorById = function(id) {
	return Promise.resolve(null);
};

MetadataManager.prototype.updateAuthenticator = function() {
	return Promise.resolve(null);
};

MetadataManager.prototype.deleteAuthenticator = function() {
	return Promise.resolve(null);
};