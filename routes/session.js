var express = require('express');
var router = express.Router();

var passport = require('../authentication');

/**
 * Login.
 *
 * Parameters:
 *   username: NetID
 *   password: Active Directory password
 */
router.post('/', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

/**
 * Logout.
 */
router.delete('/', function(req, res) {
    req.logout();
    res.status(204).end();
});

module.exports = {
    prefix: '/api/session',
    router: router
};
