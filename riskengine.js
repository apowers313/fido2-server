module.exports = RiskEngine;

function RiskEngine(opt) {

} 

RiskEngine.prototype.init = function(server) {
	return Promise.resolve (null);
};

RiskEngine.prototype.shutdown = function() {
	return Promise.resolve (null);
};

RiskEngine.prototype.addRules = function(rules) {

};

RiskEngine.prototype.listRules = function() {
	return [];
};

RiskEngine.prototype.evaluate = function() {
	cb (null, true);
};