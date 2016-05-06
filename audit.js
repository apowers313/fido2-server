var _ = require("lodash");
var bunyan = require("bunyan");

module.exports = ServerAudit;

function ServerAudit(opt) {
    var levels = {

    };
    if (opt === undefined) opt = {};
    var defaults = {
        name: "FIDO-Server",
        level: "trace",
        outputFile: "./fido-server-log.json"
    };
    opt = _.defaultsDeep(opt, defaults);
    // TODO: check options
    this.name = opt.name;
    this.level = opt.level;
    this.outputFile = opt.outputFile;

    this.logger = bunyan.createLogger({
        name: this.name,
        level: this.level,
        streams: [{
            path: this.outputFile,
            level: this.level
        }, {
            stream: process.stdout,
            level: this.level
        }]
    });
    this.logger.info("Audit log starting");
    process.on('exit', function() {
        this.shutdown();
    }.bind(this));
}

ServerAudit.prototype.log = function(level) {
    // switch (level) {
    // }
};

ServerAudit.prototype.logError = function(status, error) {

};

ServerAudit.prototype.fatal = function() {
    callWithArgs(this.logger, "error", arguments);
    callWithArgs(this, "alert", arguments);
};

ServerAudit.prototype.error = function() {
    callWithArgs(this.logger, "error", arguments);
};

ServerAudit.prototype.warn = function() {
    callWithArgs(this.logger, "warn", arguments);
};

ServerAudit.prototype.info = function() {
    callWithArgs(this.logger, "info", arguments);
};

ServerAudit.prototype.debug = function() {
    callWithArgs(this.logger, "debug", arguments);
};

ServerAudit.prototype.trace = function() {
    callWithArgs(this.logger, "trace", arguments);
};

ServerAudit.prototype.alert = function() {
    console.log("!!! ALERT");
    // TODO: SNMP trap? email? SMS?
};

ServerAudit.prototype.flush = function() {

};

ServerAudit.prototype.shutdown = function() {
    this.logger.info("Audit log shutting down");
};

ServerAudit.prototype.list = function() {
    return [];
};

function callWithArgs(ctx, fnName, args) {
    var fn = ctx[fnName];
    fn.apply(ctx, Array.prototype.slice.call(args));
}