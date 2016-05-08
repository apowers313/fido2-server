module.exports = RiskEngine;

function RiskEngine(opts) {

} 

RiskEngine.prototype.init = function() {
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