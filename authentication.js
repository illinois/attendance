var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ldap = require('ldapjs');

var db = require('./models');

/**
 * Authenticate with UIUC Active Directory using an LDAP simple bind.
 */
passport.use(new LocalStrategy(function(username, password, done) {
    var client = ldap.createClient({
        url: 'ldaps://ad.uillinois.edu:636'
    });

    var dn = username + '@illinois.edu';
    client.bind(dn, password, function(err, user) {
        client.unbind();

        if (err) {
            if (err.name === 'InvalidCredentialsError') {
                return done(null, false);
            }
            return done(err);
        }

        db.User.findOrCreate({netid: username})
        .success(function(user) {
            if (!user.name) {
                var client = ldap.createClient({
                    url: 'ldap://ldap.uiuc.edu:389'
                });
                var base = 'dc=uiuc,dc=edu';
                var opts = {
                    filter: 'uid=' + user.netid,
                    scope: 'sub',
                    sizeLimit: 1
                };
                client.search(base, opts, function(err, res) {
                    res.on('searchEntry', function(entry) {
                        user.updateAttributes({
                            name: (entry.object.uiucEduFirstName + ' ' +
                                   entry.object.uiucEduLastName)
                        })
                        .success(function() {
                            done(null, user);
                        });
                    });

                    res.on('error', function() {
                        done(null, user);
                    });
                });
            } else {
                done(null, user);
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.netid);
});

passport.deserializeUser(function(netid, done) {
    db.User.find({
        where: {netid: netid}
    })
    .success(function(user) {
        done(null, user);
    });
});

module.exports = passport;
