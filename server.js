var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var path = require('path');

var baseUrl = require('./baseurl');
var config = require('./config');
var passport = require('./authentication');
var db = require('./models');
var fetchIDPhoto = require('./fetch-id-photo');

var app = express();
var router = express.Router();

app.set('view engine', 'ejs');
app.use(baseUrl, express.static(path.join(__dirname, '/public')));

const sessionStore = new SequelizeStore({
    db: db.sequelize,
});
app.use(session({
    store: sessionStore,
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));
sessionStore.sync();

app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());

// Load all routes from routes/ directory.
require('./routes')(app);

/**
 * Return 404 on all nonexistent API endpoints.
 */
router.get('/api/*', function(req, res) {
    res.status(404).end();
});

/**
 * Alternate logout route.
 *
 * Allows users to log out by directing their browser directly to /logout.
 */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect(path.join(baseUrl, '/login'));
});

/**
 * Render single-page application on all other non-API routes.
 */
router.get('*', function(req, res) {
    res.render('index', {
        baseUrl: baseUrl,
        user: req.user
    });
});

app.use(baseUrl, router);

/**
 * Redirect / to baseUrl if baseUrl is not /.
 */
if (baseUrl) {
    app.get('/', function(req, res) {
        res.redirect(baseUrl);
    });
}

// Keep My.CS Portal session alive by sending a request every 10 minutes
fetchIDPhoto(0);
setInterval(fetchIDPhoto, 600000, 0);

db.sequelize.sync().then(function() {
    app.listen(config.port);
});
