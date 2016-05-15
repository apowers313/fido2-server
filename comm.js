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

    restServer.post("/register", function(req, res, next) {
        console.log("Register");
        console.log(req.body);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        server.makeCredentialResponse(req.body.userId, req.body)
            .then(function(cred) {
                res.send(cred);
            })
            .catch(function(err) {
            	res.send({error: err.message});
            });
        // return next();
    });

    restServer.post("/login", function(req, res, next) {
        console.log("Login");
        console.log(req.body);
        // TODO: should be configurable
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(JSON.stringify({ foo: "bar" }));
        // return next();
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
