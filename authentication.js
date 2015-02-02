var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ldap = require('ldapjs');

var db = require('./models');

/**
 * Authenticate with UIUC Active Directory using an LDAP simple bind.
 */
passport.use(new LocalStrategy(function(username, password, done) {
    var client = ldap.createClient({
        url: 'ldaps://ad.uiuc.edu:636'
    });

    var dn = 'cn=' + username + ',ou=Campus Accounts,dc=ad,dc=uiuc,dc=edu';
    client.bind(dn, password, function(err, user) {
        client.unbind();

        if (err) {
            if (err.name === 'InvalidCredentialsError') {
                return done(null, false);
            }
            return done(err);
        }

        db.User.findOrCreate({netid: username})
        .spread(function(user, created) {
            // If the user was just created, don't call getNameFromLDAP()
            // because it has already been called by User's afterCreate hook.
            if (!created && !user.name) {
                user.getNameFromLDAP();
            }
            done(null, user);
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
