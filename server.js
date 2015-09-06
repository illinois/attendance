var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('connect-mysql')(session);
var async = require('async');

var baseUrl = require('./baseurl');
var config = require('./config');
var passport = require('./authentication');
var db = require('./models');
var parseSwipe = require('./parse-swipe');

var NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();
var router = express.Router();

app.set('view engine', 'ejs');
app.use(baseUrl, express.static(__dirname + '/public'));

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
 * Login.
 *
 * Parameters:
 *   username: NetID
 *   password: Active Directory password
 */
router.post('/api/session', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

/**
 * Logout.
 */
router.delete('/api/session', function(req, res) {
    req.logout();
    res.status(204).end();
});

router.get('/api/courses', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    req.user.getCourses()
    .success(function(courses) {
        res.send({courses: courses});
    });
});

router.post('/api/courses', function(req, res) {
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

router.get('/api/courses/:id', function(req, res) {
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

router.get('/api/courses/:id/staff', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Course.find({
        where: {id: req.params.id},
        include: [db.User]
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(401).end();
            res.send({staff: course.users});
        });
    });
});

router.post('/api/courses/:id/staff', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.netid) return res.status(400).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(401).end();
            db.User.findOrCreate({netid: req.body.netid})
            .success(function(user) {
                user.addCourse(course)
                .success(function() {
                    res.send(user);
                });
            });
        });
    });
});

router.get('/api/courses/:id/sections', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
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

router.post('/api/courses/:id/sections', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.name) return res.status(400).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
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

router.get('/api/sections/:id', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            res.send(section);
        });
    });
});

router.get('/api/sections/:id/checkins', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            var last = req.query.last;
            db.Checkin.findAll({
                where: {SectionId: req.params.id},
                order: last ? [['createdAt', 'DESC']] : null,
                limit: last ? 5 : null
            })
            .success(function(checkins) {
                checkins = checkins.map(function(checkin) {
                    return checkin.values;
                });
                async.each(checkins, function(checkin, callback) {
                    db.Student.find({
                        where: {CourseId: section.CourseId, uin: checkin.uin}
                    })
                    .success(function(student) {
                        if (student) {
                            checkin.netid = student.netid;
                            checkin.fullName = student.fullName;
                        } else {
                            checkin.netid = '';
                            checkin.fullName = '';
                        }
                        callback();
                    });
                }, function() {
                    res.send({checkins: checkins});
                });
            });
        });
    });
});

router.get('/api/sections/:id/checkins.csv', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(401).end();
            var query = (
                'SELECT Checkins.uin, Students.netid, ' +
                'Checkins.createdAt AS timestamp ' +
                'FROM Checkins ' +
                'JOIN Sections ON Checkins.SectionId = Sections.id ' +
                'LEFT JOIN Students ON ' +
                'Students.CourseId = Sections.CourseId ' +
                'AND Students.uin = Checkins.uin ' +
                'WHERE SectionId = 1 ORDER BY timestamp'
            );
            db.sequelize.query(query, null, {raw: true}, [req.params.id])
            .success(function(checkins) {
                res.attachment(section.name.replace(/\//g, '-') + '.csv');
                res.write('uin,netid,timestamp\n');
                async.eachSeries(checkins, function(checkin, callback) {
                    var uin = checkin.uin;
                    var netid = checkin.netid || '';
                    var timestamp = checkin.timestamp.toISOString();
                    res.write(uin + ',' + netid + ',' + timestamp + '\n');
                    callback();
                }, function() {
                    res.end();
                });
            });
        });
    });
});

router.post('/api/sections/:id/checkins', function(req, res) {
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

router.get('/api/courses/:id/checkins/:uin', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(401).end();
            db.Checkin.findAll({
                where: {
                    uin: req.params.uin,
                    'Section.CourseId': req.params.id
                },
                include: [db.Section]
            })
            .success(function(checkins) {
                res.send({checkins: checkins});
            });
        });
    });
});

router.get('/api/sections/:id/comments', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
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

router.post('/api/sections/:id/comments', function(req, res) {
    if (!req.isAuthenticated()) return res.status(401).end();
    if (!req.body.text) return res.status(400).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
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
    res.redirect('/login');
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

db.sequelize.sync()
.complete(function(err) {
    if (err) {
        throw err[0];
    } else {
        app.listen(config.port);
    }
});
