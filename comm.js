var _ = require("lodash");
var restify = require("restify");

module.exports = ServerComm;

/**
 * Implements the ServerComm class
 * Restify-based REST endpoints for communicating with the FIDO Server
 */
function ServerComm(opt) {
	var defaults = {
		loginRoute: "/login",
		registerRoute: "/register",
		port: 0xF1D0,
	};
	opt = _.defaultsDeep(opt, defaults);
	// TODO: check options
	this.loginRoute = opt.loginRoute;
	this.registerRoute = opt.registerRoute;
	this.port = opt.port;
}

/**
 * Sets up the communications for the server
 */
ServerComm.prototype.init = function(server) {
	this.server = server;
	console.log(server);
	var restConfig = {
		// TODO: key & certificate
		name: this.server.rpid,
		version: this.server.version.major + "." +
			this.server.version.major + "." +
			this.server.version.patch,
		// log: this.server.audit.bunyan
	};

	console.log("RPID:", this.server.rpid);
	var restServer = restify.createServer(restConfig);
	restServer.use(restify.acceptParser(restServer.acceptable));
	restServer.use(restify.queryParser());
	restServer.use(restify.bodyParser());

	restServer.post("/attestationChallenge", function(req, res, next) {
		console.log("attestationChallenge");
		console.log(req.body);
		// TODO: should be configurable
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		// if the user doesn't exist, create it
		// NOTE: other implementations may not create the user here
		// and may assume that the user already exists with a password-based login.
		// If that's the case, then this would be the right place to lookup the
		// userId based on the cookie or by whatever other method.
		server.account.createUser(req.body.userId)
			.then(function(user) {
				console.log("Register created user:", user);
				return server.getAttestationChallenge(req.body.userId);
			})
			.then(function(challenge) {
				console.log ("getAttestationChallenge challenge:");
				console.log (challenge);
				res.send(challenge);
			})
			.catch(function(err) {
				console.log("ERROR:");
				console.log(err);
				res.send({
					error: err.message
				});
			});
	});

	restServer.post("/register", function(req, res, next) {
		console.log("Register");
		console.log(req.body);
		// XXX TODO: this should be an option
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		server.makeCredentialResponse(req.body.userId, req.body)
			.then(function(cred) {
				res.send(cred);
			})
			.catch(function(err) {
				res.send({
					error: err.message
				});
			});
		// return next();
	});

	restServer.post("/assertionChallenge", function(req, res, next) {
		console.log("assertionChallenge");
		console.log(req.body);
		// TODO: should be configurable
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		server.getAssertionChallenge(req.body.userId)
			.then(function(challenge) {
				console.log ("getAssertionChallenge challenge:");
				console.log (challenge);
				res.send(challenge);
			})
			.catch(function(err) {
				console.log("ERROR:");
				console.log(err);
				res.send({
					error: err.message
				});
			});
	});

	restServer.post("/login", function(req, res, next) {
		console.log("Login");
		console.log(req.body);
		// TODO: should be configurable
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		server.getAssertionResponse(req.body.userId, req.body)
			.then(function(assertion) {
				console.log ("Comm sending:", assertion);
				res.send(assertion);
			})
			.catch(function(err) {
				console.log("ERROR:");
				console.log(err);
				res.send({
					error: err.message
				});
			});
	});

	restServer.listen(this.port, function() {
		console.log('%s listening at %s', restServer.name, restServer.url);
	});

	this.restify = server;

	return Promise.resolve(this);
};

/**
 * Tear down all server communcations
 */
ServerComm.prototype.shutdown = function() {
	return Promise.resolve(null);
};