module.exports = FidoExtension;

function FidoExtension(opts) {

}

FidoExtension.prototype.init = function() {
	return Promise.resolve (null);
}

FidoExtension.prototype.shutdown = function() {
	return Promise.resolve (null);
}

FidoExtension.prototype.send = function() {
	return {};
};

FidoExtension.prototype.receive = function() {
	return {};
};
