var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ldap = require('ldapjs');

var db = require('./models');

/**
 * Authenticate with UIUC Active Directory using an LDAP simple bind.
 */
passport.use(new LocalStrategy(function(username, password, done) {
    var client = ldap.createClient({
        url: 'ldap://ad.uillinois.edu:389'
    });

    // XXX: Prod server has a problem with the AD server's TLS cert for some
    // reason. Connect anyway.
    var tlsOptions = {rejectUnauthorized: false};
    client.starttls(tlsOptions, null, function(err) {
        var dn = username + '@illinois.edu';
        client.bind(dn, password, function(err, user) {
            if (err) {
                if (err.name === 'InvalidCredentialsError') {
                    return done(null, false);
                }
                return done(err);
            }

            db.User.findOrCreate({netid: username})
            .spread(function(user, created) {
                // If the user was just created, don't call getNameFromLDAP()
                // because it has already been called by User's afterCreate
                // hook.
                if (!created && !user.name) {
                    user.getNameFromLDAP();
                }
                done(null, user);
            });
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
