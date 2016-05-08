module.exports = FidoExtension;

// Support for various FIDO2 / Webauthn Extensions
// See Sections 5 & 6 of the Webauthn specification (May 8, 2016)
function FidoExtension(opts) {

}

FidoExtension.prototype.init = function() {
	return Promise.resolve (null);
};

FidoExtension.prototype.shutdown = function() {
	return Promise.resolve (null);
};

FidoExtension.prototype.send = function() {
	return {};
};

FidoExtension.prototype.receive = function() {
	return {};
};
