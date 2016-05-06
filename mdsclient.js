module.exports = MdsClient;

// TODO: handle side-loading certs / metadata

function MdsClient(opts) {

}

MdsClient.prototype.init = function() {
	return Promise.resolve (null);
}

MdsClient.prototype.shutdown = function() {
	return Promise.resolve (null);
}

MdsClient.prototype.update = function(cb) {
	cb(null, null);
};

MdsClient.prototype.list = function() {
	return [];
};