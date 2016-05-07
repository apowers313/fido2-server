 module.exports = ServerComm;

function ServerComm(opts) {
}

ServerComm.prototype.init = function() {
	return Promise.resolve (null);
};

ServerComm.prototype.shutdown = function() {
	return Promise.resolve (null);
};

ServerComm.prototype.receive = function (cb) {
	cb (null, null);
};

ServerComm.prototype.send = function (cb) {
	cb (null, null);
};