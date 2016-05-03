module.exports = FidoExtension;

function FidoExtension(opts) {

}

FidoExtension.prototype.init = function(cb) {
	cb (null, null);
};

FidoExtension.prototype.send = function() {
	return {};
};

FidoExtension.prototype.receive = function() {
	return {};
};

FidoExtension.prototype.shutdown = function() {
	return {};
};