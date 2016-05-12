var _ = require("lodash");

module.exports = ServerComm;

/**
 * Implements the ServerComm class
 * Restify-based REST endpoints for communicating with the FIDO Server
 */
function ServerComm(server, opt) {
	var defaults = {
		loginRoute: "/login",
		registerRoute: "/register",
		port: 8088,
	};
	opt = _.defaultsDeep(opt, defaults);
	// TODO: check options
	this.loginRoute = opt.loginRoute;
	this.registerRoute = opt.registerRoute;
	this.port = opt.port;
	this.server = server;
}

/**
 * Sets up the communications for the server
 */
ServerComm.prototype.init = function() {
	var app = express();

	app.use(bodyParser.json());

	app.post(this.registerRoute, function(req, res) {
		console.log("Register");
		console.log(req.body);
		res.redirect("/redirect.html");
	});

	app.post(this.loginRoute, function(req, res) {
		console.log("Login");
		console.log(req.body);
		res.send(req.body);
	});

	this.express = app.listen(this.port);

	this.app = app;

	return Promise.resolve(this);
};

/**
 * Tear down all server communcations
 */
ServerComm.prototype.shutdown = function() {
	return Promise.resolve(null);
};

ServerComm.prototype.receive = function(cb) {
	cb(null, null);
};

ServerComm.prototype.send = function(cb) {
	cb(null, null);
};