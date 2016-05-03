var FIDOServer = require ("../server.js");
var bodyParser = require ("body-parser");
var express = require("express");
var app = express();

var server = new FIDOServer();
app.use(bodyParser.json ());

app.get ("/", function (req, res) {
	console.log ("serving register.html");
	res.sendFile ("./register.html", {root: "."});
});

app.get ("/login.html", function (req, res) {
	console.log ("serving login.html");
	res.sendFile ("./login.html", {root: "."});
});

app.get ("/ms-webauth-polyfill.js", function (req, res) {
	console.log ("serving polyfill");
	res.sendFile ("./ms-webauth-polyfill.js", {root: "."});
});

app.post ("/register", function (req, res) {
	console.log ("Register");
	console.log(req.body);
	res.redirect ("/redirect.html");
});

app.post ("/login", function (req, res) {
	console.log ("Login");
	console.log(req.body);
	res.send (req.body);
});

app.listen (8088);