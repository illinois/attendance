var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var LdapStrategy = require('passport-ldapbind').Strategy;
var session = require('express-session');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'not secret',
    resave: true,
    saveUninitialized: true
}));
passport.use(new LdapStrategy({
    server: {
        url: 'ldap://ad.uillinois.edu:389'
    }
}, function(user, done) {
    if (user !== 'klwang3@illinois.edu') {
        return done(null, false);
    }
    return done(null, user);
}));
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(id, done) {
    done(null, id);
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res) {
    res.sendFile('/public/index.html', {root: __dirname});
});

app.post('/api/session', passport.authenticate('ldapBind'), function(req, res) {
    res.send({status: 'ok', user: req.user});
});

app.listen(3000);
