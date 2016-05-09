module.exports = MdsClient;

// TODO: handle side-loading certs / metadata

/**
 * Manages loading metadata and attestation certs for authenticators 
 * through the Metadata Service (MDS) and through JSON statments stored 
 * in a watch folder.
 */
function MdsClient(opts) {

}

MdsClient.prototype.init = function() {
	return Promise.resolve (null);
};

MdsClient.prototype.shutdown = function() {
	return Promise.resolve (null);
};

MdsClient.prototype.update = function(cb) {
	cb(null, null);
};

MdsClient.prototype.list = function() {
	return [];
};