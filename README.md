# fido2-server
A FIDO 2.0 / W3C WebAuthn server

<!-- START doctoc -->
<!-- END doctoc -->

## Installation

Command Line:<br>
`npm install -g fido2-server`

API:<br>
`npm install fido2-server`

## Command Line

## API

## Configuration
TBD

* rpid
* blacklist
* modules
* cryptoParameterPrefs

## Modules

must have .init and .shutdown
specified as a string for the package to be loaded, or a object representing the module that has already been created (the server will initialize it).

### Account
stores user and credential information

* listUsers
* createUser (id, userInfo)
* getUserByGuid (guid)
* getUserById (id)
* updateUserAttestation (id, attestation)
* updateUser
* deleteUser
* listCredentials
* createCredential
* getCredential
* updateCredential
* deleteCredential

### Audit
responsible for logging, alerts, etc.

* fatal
* error
* warn
* info
* debug
* trace
* alert
* list

### Extension
manages FIDO 2.0 / W3C WebAuthn extensions
See Sections 5 & 6 of the WebAuthn specification

### Metadata Manager
loads and manages authenticator metadata

### Risk Engine
enfoces policies on which authenticators to trust

* addRules
* deleteRule
* listRules
* evaluate