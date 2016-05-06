module.exports = RiskEngine;

function RiskEngine(opts) {

} 

RiskEngine.prototype.init = function() {
	return Promise.resolve (null);
}

RiskEngine.prototype.shutdown = function() {
	return Promise.resolve (null);
}

RiskEngine.prototype.addRule = function() {

};

RiskEngine.prototype.listRules = function() {
	return [];
};

RiskEngine.prototype.evaluate = function(cb) {
	cb (null, true);
};