module.exports = ServerComm;

function ServerComm(opts) {
}

ServerComm.prototype.receive = function (cb) {
	cb (null, null);
};

ServerComm.prototype.send = function (cb) {
	cb (null, null);
};