module.exports = RiskEngine;

function RiskEngine(opts) {

} 

RiskEngine.prototype.addRule = function() {

};

RiskEngine.prototype.listRules = function() {
	return [];
};

RiskEngine.prototype.evaluate = function(cb) {
	cb (null, true);
};