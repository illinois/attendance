var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('connect-mysql')(session);
var async = require('async');

var config = require('./config');
var passport = require('./authentication');
var db = require('./models');
var parseSwipe = require('./parse-swipe');

var NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var dbConfig = config.db[NODE_ENV];
app.use(session({
    store: new MySQLStore({
        config: {
            host: dbConfig.host,
            database: dbConfig.database,
            user: dbConfig.username,
            password: dbConfig.password
        }
    }),
    secret: config.sessionSecret,
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

app.get('/api/courses/:id/sections', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(401).end();
            course.getSections()
            .success(function(sections) {
                res.send({sections: sections});
            });
        });
    });
});

app.post('/api/courses/:id/sections', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.name) return res.status(400).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(401).end();
            db.Section.create({
                name: req.body.name
            })
            .success(function(section) {
                course.addSection(section)
                .success(function() {
                    res.send(section);
                });
            });
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
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(401).end();
            res.send(course);
        });
    });
});

app.get('/api/sections/:id', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            res.send(section);
        });
    });
});

app.get('/api/sections/:id/checkins', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            var last = req.query.last;
            db.Checkin.findAll({
                where: {SectionId: req.params.id},
                order: last ? [['createdAt', 'DESC']] : null,
                limit: last ? 5 : null
            })
            .success(function(checkins) {
                res.send({checkins: checkins});
            });
        });
    });
});

app.get('/api/sections/:id/checkins.csv', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            var query = (
                'SELECT uin, createdAt as timestamp ' +
                'FROM Checkins WHERE SectionId=? ' +
                'ORDER BY timestamp'
            );
            db.sequelize.query(query, null, {raw: true}, [req.params.id])
            .success(function(checkins) {
                res.attachment(section.name + '.csv');
                res.write('uin,timestamp\n');
                async.each(checkins, function(checkin, callback) {
                    var uin = checkin.uin;
                    var timestamp = checkin.timestamp.toISOString();
                    res.write(uin + ',' + timestamp + '\n');
                    callback();
                }, function() {
                    res.end();
                });
            });
        });
    });
});

app.post('/api/sections/:id/checkins', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.swipeData) return res.status(400).end();

    var uin = parseSwipe(req.body.swipeData);
    if (!uin) return res.status(400).end();

    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            db.Checkin.find({
                where: {SectionId: req.params.id, uin: uin}
            })
            .success(function(checkin) {
                if (checkin) return res.status(409).send(checkin);
                db.Checkin.create({uin: uin})
                .success(function(checkin) {
                    checkin.setUser(req.user)
                    .success(function() {
                        section.addCheckin(checkin)
                        .success(function() {
                            res.send(checkin);
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/sections/:id/comments', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            section.getComments({
                include: [db.User]
            })
            .success(function(comments) {
                res.send({comments: comments});
            });
        });
    });
});

app.post('/api/sections/:id/comments', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.text) return res.status(400).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            db.Comment.create({text: req.body.text})
            .success(function(comment) {
                comment.setUser(req.user)
                .success(function() {
                    section.addComment(comment)
                    .success(function() {
                        db.Comment.find({
                            where: {id: comment.id},
                            include: [db.User]
                        })
                        .success(function(commentWithUser) {
                            res.send(commentWithUser);
                        });
                    });
                });
            });
        });
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

db.sequelize.sync()
.complete(function(err) {
    if (err) {
        throw err[0];
    } else {
        app.listen(config.port);
    }
});
