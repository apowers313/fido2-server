# fido2-server
A [FIDO 2.0](https://fidoalliance.org) / [W3C WebAuthn](http://w3c.github.io/webauthn/) server

**This is not the project you are looking for. :)**

It is incomplete, deprecated, and will not be updated in the future. But wait, there's more...

This started off as a proof of concept for a FIDO2 server, but when I realized that there were going to be a million different configurations (LDAP, SQL, Mongo backends; different loggers like syslog or banyon; policy engines; risk engines; etc.) I switched to [simple-component-manager](https://github.com/apowers313/simple-component-manager) to enable mixing and matching pieces.

**The project you probably want is** [fido2-server-demo](https://github.com/apowers313/fido2-server-demo) which pulls together a sample set of components for a FIDO2 server. Also, see [webauthn.org](https://webauthn.org/) for a live example.