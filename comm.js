 module.exports = ServerComm;

/**
 * Implements the ServerComm class
 * Restify-based REST endpoints for communicating with the FIDO Server
 */ 
function ServerComm(opts) {
}

/**
 * Sets up the communications for the server
 */
ServerComm.prototype.init = function() {
	return Promise.resolve (null);
};

/**
 * Tear down all server communcations
 */
ServerComm.prototype.shutdown = function() {
	return Promise.resolve (null);
};

ServerComm.prototype.receive = function (cb) {
	cb (null, null);
};

ServerComm.prototype.send = function (cb) {
	cb (null, null);
};