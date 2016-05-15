var _ = require("lodash");
var bunyan = require("bunyan");

// TODO: freeze this module to make it tamper resistant

module.exports = ServerAudit;

/**
 * Auditing constructor
 */
function ServerAudit(opt) {
    var levels = {

    };
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
}

/**
 * Initialize auditing
 */
ServerAudit.prototype.init = function(server) {
    return new Promise(function(resolve, reject) {
        this.logger = this.bunyan = bunyan.createLogger({
            name: this.name,
            level: this.level,
            streams: [{
                    path: this.outputFile,
                    level: this.level
                },
                // {
                //     stream: process.stdout,
                //     level: this.level
                // }
            ]
        });
        this.logger.info("Audit log starting");

        process.on('exit', function() {
            this.shutdown();
        }.bind(this));

        resolve(this);
    }.bind(this));
};

/**
 * Terminate auditing
 */
ServerAudit.prototype.shutdown = function() {
    this.logger.info("Audit log shutting down");
    return Promise.resolve(null);
};

/**
 * Log a fatal error that will result in this program terminating
 */
ServerAudit.prototype.fatal = function() {
    callWithArgs(this.logger, "error", arguments);
    callWithArgs(this, "alert", arguments);
};

/**
 * Log a non-fatal error, such as permissions errors
 */
ServerAudit.prototype.error = function() {
    callWithArgs(this.logger, "error", arguments);
};

/**
 * Log a warning
 */
ServerAudit.prototype.warn = function() {
    callWithArgs(this.logger, "warn", arguments);
};

/**
 * Log an informational / status message
 */
ServerAudit.prototype.info = function() {
    callWithArgs(this.logger, "info", arguments);
};

/**
 * Log a debug message
 */
ServerAudit.prototype.debug = function() {
    callWithArgs(this.logger, "debug", arguments);
};

/**
 * Log a trace message
 */
ServerAudit.prototype.trace = function() {
    callWithArgs(this.logger, "trace", arguments);
};

/**
 * Throw an alert. This may be overridden to do something more interesting, such as
 * Trigging a SNMP trap, sending an email, sending an SMS, etc.
 */
ServerAudit.prototype.alert = function() {
    console.log("!!! ALERT");
    // TODO: SNMP trap? email? SMS?
};

/**
 * Flush any pending messages
 */
ServerAudit.prototype.flush = function() {

};

/**
 * Get a list of all log messages
 */
ServerAudit.prototype.list = function() {
    return [];
};

/*
 * Helper function for calling functions with variable arguments
 */ 
function callWithArgs(ctx, fnName, args) {
    var fn = ctx[fnName];
    fn.apply(ctx, Array.prototype.slice.call(args));
}