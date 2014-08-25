var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var passport = require('./authentication');
var db = require('./models');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'not secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());

/**
 * Parameters:
 *   username: NetID
 *   password: Active Directory password
 */
app.post('/api/session', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

app.delete('/api/session', function(req, res) {
    req.logout();
    res.status(204).end();
});

app.get('/api/courses', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    req.user.getCourses()
    .success(function(courses) {
        res.send({courses: courses});
    });
});

app.post('/api/courses', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.name) return res.status(400).end();
    db.Course.create({
        name: req.body.name
    })
    .success(function(course) {
        course.addUser(req.user)
        .success(function() {
            res.send(course);
        });
    });
});

app.get('/api/courses/:id', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Course.find({
        where: {id: req.params.id},
        include: [db.User, db.Section]
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        res.send(course);
    });
});

app.get('/api/*', function(req, res) {
    res.status(404).end();
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

app.get('*', function(req, res) {
    res.render('index', {user: req.user});
});

db
.sequelize
.sync({ force: true })
.complete(function(err) {
    if (err) {
        throw err[0];
    } else {
        db.Course.create({name: 'CS 225'})
        .success(function(course) {
            db.User.create({netid: 'klwang3'})
            .success(function(user) {
                course.addUser(user);
            });

            db.Section.create({name: 'lab_intro'})
            .success(function(section) {
                course.addSection(section);
            });

            db.Section.create({name: 'lab_debug'})
            .success(function(section) {
                course.addSection(section);
            });
        });
        app.listen(3000);
    }
});
