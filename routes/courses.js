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
    req.user.getCourses().then(function(courses) {
        res.send({courses: courses});
    });
});

router.post('/', function(req, res) {
    if (!req.body.name) return res.status(400).end();
    db.Course.create({
        name: req.body.name
    }).then(function(course) {
        return course.addUser(req.user);
    }).then(function(course) {
        res.send(course);
    });
});

router.get('/:id', function(req, res) {
    db.Course.findForUser({
        where: {id: req.params.id},
        include: [db.Section]
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        res.send(course);
    });
});

router.get('/:id/staff', function(req, res) {
    db.Course.findForUser({
        where: {id: req.params.id},
        include: [db.User]
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        res.send({staff: course.users});
    });
});

router.post('/:id/staff', function(req, res) {
    if (!req.body.netid) return res.status(400).end();
    db.Course.findForUser({
        where: {id: req.params.id}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        db.User.findOrCreate({
            where: {netid: req.body.netid}
        }).spread(function(user) {
            return [user, user.addCourse(course)];
        }).spread(function(user) {
            res.send(user);
        });
    });
});

router.delete('/:courseId/staff/:userId', function(req, res) {
    db.Course.findForUser({
        where: {id: req.params.courseId}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        db.User.find({
            where: {id: req.params.userId}
        }).then(function(user) {
            return course.removeUser(user);
        }).then(function() {
            res.status(200).end();
        });
    });
});

router.get('/:id/roster', function(req, res) {
    db.Course.findForUser({
        where: {id: req.params.id}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        db.Student.findAndCountAll({
            where: {CourseId: req.params.id},
            limit: 1
        }).then(function(result) {
            var count = result.count;
            var rows = result.rows;
            res.send({
                count: count,
                lastUpdated: count > 0 ? rows[0].updatedAt : null
            });
        });
    });
});

router.post('/:id/roster',
            upload.single('roster'),
            function(req, res) {
    if (!req.file) return res.status(400).end();
    db.Course.findForUser({
        where: {id: req.params.id}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        var roster = req.file.buffer.toString();
        importRoster(roster, req.params.id)
        .spread(function(count, lastUpdated) {
            if (count === 0) {
                res.status(400).end();
            } else {
                res.send({
                    count: count,
                    lastUpdated: lastUpdated
                });
            }
        });
    });
});

router.get('/:id/sections', function(req, res) {
    db.Course.findForUser({
        where: {id: req.params.id}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        course.getSections().then(function(sections) {
            res.send({sections: sections});
        });
    });
});

router.post('/:id/sections', function(req, res) {
    if (!req.body.name) return res.status(400).end();
    db.Course.findForUser({
        where: {id: req.params.id}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        db.Section.create({
            name: req.body.name
        }).then(function(section) {
            return [section, course.addSection(section)];
        }).spread(function(section) {
            res.send(section);
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
        db.Course.findForUser({
            where: {id: req.params.id}
        }, req.user).spread(function(course, allowed) {
            if (!course) return res.status(404).end();
            if (!allowed) return res.status(403).end();
            db.Checkin.findAll({
                where: {
                    uin: uin,
                    'Section.CourseId': req.params.id
                },
                include: [db.Section]
            }).then(function(checkins) {
                res.send({checkins: checkins});
            });
        });
    });
});

router.get('/:id/checkins.csv', function(req, res) {
    db.Course.findForUser({
        where: {id: req.params.id}
    }, req.user).spread(function(course, allowed) {
        if (!course) return res.status(404).end();
        if (!allowed) return res.status(403).end();
        var query = (
            'SELECT sections.name AS sectionName, checkins.uin, ' +
            'students.netid, checkins.createdAt AS timestamp ' +
            'FROM checkins ' +
            'JOIN sections ON checkins.sectionId = sections.id ' +
            'JOIN courses ON sections.courseId = courses.id ' +
            'LEFT JOIN students ON ' +
            'students.courseId = sections.courseId ' +
            'AND students.uin = checkins.uin ' +
            'WHERE courses.id = ? ORDER BY sections.id, timestamp'
        );
        db.sequelize.query(query, {
            replacements: [req.params.id],
            type: db.sequelize.QueryTypes.SELECT
        }).then(function(checkins) {
            res.attachment(course.name.replace(/\//g, '-') + '.csv');
            writeCSV(checkins, res);
        });
    });
});

module.exports = {
    prefix: '/api/courses',
    router: router
};
