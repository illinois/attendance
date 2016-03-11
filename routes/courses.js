var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage});

var db = require('../models');
var importRoster = require('../import-roster');
var parseSwipe = require('../parse-swipe');
var writeCSV = require('../write-csv');

router.use(require('../middleware/require-auth'));

router.get('/', function(req, res) {
    req.user.getCourses()
    .success(function(courses) {
        res.send({courses: courses});
    });
});

router.post('/', function(req, res) {
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

router.get('/:id', function(req, res) {
    db.Course.find({
        where: {id: req.params.id},
        include: [db.Section]
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
            res.send(course);
        });
    });
});

router.get('/:id/staff', function(req, res) {
    db.Course.find({
        where: {id: req.params.id},
        include: [db.User]
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
            res.send({staff: course.users});
        });
    });
});

router.post('/:id/staff', function(req, res) {
    if (!req.body.netid) return res.status(400).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
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

router.delete('/:courseId/staff/:userId', function(req, res) {
    db.Course.find({
        where: {id: req.params.courseId}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        db.User.find({
            where: {id: req.params.userId}
        })
        .success(function(user) {
            course.removeUser(user)
            .success(function() {
                res.send(200);
            });
        });
    });
});

router.get('/:id/roster', function(req, res) {
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
            db.Student.findAndCountAll({
                where: {CourseId: req.params.id},
                limit: 1
            })
            .success(function(result) {
                var count = result.count;
                var rows = result.rows;
                res.send({
                    count: count,
                    lastUpdated: count > 0 ? rows[0].updatedAt : null
                });
            });
        });
    });
});

router.post('/:id/roster',
            upload.single('roster'),
            function(req, res) {
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
            if (!req.file) return res.status(400).end();
            var roster = req.file.buffer.toString();
            importRoster(roster, req.params.id, function(result) {
                if (result === null) {
                    res.status(400).end();
                } else {
                    res.send({
                        count: result.count,
                        lastUpdated: result.lastUpdated
                    });
                }
            });
        });
    });
});

router.get('/:id/sections', function(req, res) {
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
            course.getSections()
            .success(function(sections) {
                res.send({sections: sections});
            });
        });
    });
});

router.post('/:id/sections', function(req, res) {
    if (!req.body.name) return res.status(400).end();
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        if (!course) return res.status(404).end();
        course.hasUser(req.user)
        .success(function(result) {
            if (!result) return res.status(403).end();
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

/**
 * Get all sections in the course which the user specified by the query
 * parameter swipeData has checked into.
 */
router.get('/:id/checkins', function(req, res) {
    if (!req.query.swipeData) return res.status(400).end();
    parseSwipe(req.query.swipeData, req.params.id, function(uin) {
        db.Course.find({
            where: {id: req.params.id}
        })
        .success(function(course) {
            course.hasUser(req.user)
            .success(function(result) {
                if (!result) return res.status(403).end();
                db.Checkin.findAll({
                    where: {
                        uin: uin,
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
});

router.get('/:id/checkins.csv', function(req, res) {
    db.Course.find({
        where: {id: req.params.id}
    })
    .success(function(course) {
        var query = (
            'SELECT Sections.name AS sectionName, Checkins.uin, ' +
            'Students.netid, Checkins.createdAt AS timestamp ' +
            'FROM Checkins ' +
            'JOIN Sections ON Checkins.SectionId = Sections.id ' +
            'JOIN Courses ON Sections.CourseId = Courses.id ' +
            'LEFT JOIN Students ON ' +
            'Students.CourseId = Sections.CourseId ' +
            'AND Students.uin = Checkins.uin ' +
            'WHERE Courses.id = ? ORDER BY Sections.id, timestamp'
        );
        db.sequelize.query(query, null, {raw: true}, [req.params.id])
        .success(function(checkins) {
            res.attachment(course.name.replace(/\//g, '-') + '.csv');
            writeCSV(checkins, res);
        });
    });
});

module.exports = {
    prefix: '/api/courses',
    router: router
};
