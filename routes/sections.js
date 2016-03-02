var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');

var db = require('../models');
var parseSwipe = require('../parse-swipe');
var fetchIDPhoto = require('../fetch-id-photo');

router.use(require('../middleware/require-auth'));

router.get('/:id', function(req, res) {
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
            res.send(section);
        });
    });
});

router.put('/:id', function(req, res) {
    if (!req.body.name) return res.status(400).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
            section.updateAttributes({
                name: req.body.name
            })
            .success(function(section) {
                res.send(section);
            });
        });
    });
});

router.get('/:id/checkins', function(req, res) {
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
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
                        where: {
                            CourseId: section.CourseId,
                            uin: checkin.uin
                        }
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

router.get('/:id/checkins.csv', function(req, res) {
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
            var query = (
                'SELECT Checkins.uin, Students.netid, ' +
                'Checkins.createdAt AS timestamp ' +
                'FROM Checkins ' +
                'JOIN Sections ON Checkins.SectionId = Sections.id ' +
                'LEFT JOIN Students ON ' +
                'Students.CourseId = Sections.CourseId ' +
                'AND Students.uin = Checkins.uin ' +
                'WHERE SectionId = ? ORDER BY timestamp'
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

router.post('/:id/checkins', function(req, res) {
    if (!req.body.swipeData) return res.status(400).end();

    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        parseSwipe(req.body.swipeData, section.CourseId, function(uin) {
            if (!uin) return res.status(400).end();
            section.hasUser(req.user, function(err, result) {
                if (!result) return res.status(403).end();
                db.Checkin.findOrCreate({
                    SectionId: req.params.id,
                    uin: uin
                }, {
                    UserId: req.user.id
                })
                .success(function(checkin, created) {
                    if (!created) return res.status(409).send(checkin);
                    checkin = checkin.values;
                    db.Student.find({
                        where: {
                            CourseId: section.CourseId,
                            uin: checkin.uin
                        }
                    })
                    .success(function(student) {
                        if (student) {
                            checkin.netid = student.netid;
                            checkin.fullName = student.fullName;
                        } else {
                            checkin.netid = '';
                            checkin.fullName = '';
                        }
                        res.send(checkin);
                    });
                });
            });
        });
    });
});

router.get('/:id/comments', function(req, res) {
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
            section.getComments({
                include: [db.User]
            })
            .success(function(comments) {
                res.send({comments: comments});
            });
        });
    });
});

router.post('/:id/comments', function(req, res) {
    if (!req.body.text) return res.status(400).end();
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
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

router.get('/:id/students/:uin/photo.jpg', function(req, res) {
    var id = req.params.id;
    db.Section.find({
        where: {id: req.params.id}
    })
    .success(function(section) {
        if (!section) return res.status(404).end();
        section.hasUser(req.user, function(err, result) {
            if (!result) return res.status(403).end();
            var uin = req.params.uin;
            db.Student.find({
                where: {CourseId: section.CourseId, uin: uin}
            })
            .success(function(student) {
                // Do not return ID photo if student is not in the roster
                if (!student) {
                    return res.sendFile('no_photo.jpg', {
                        root: path.join(__dirname, '../public/')
                    });
                }

                fetchIDPhoto(uin, function(error, response, body) {
                    res.type(response.headers['content-type']);
                    res.send(body);
                });
            });
        });
    });
});

module.exports = {
    prefix: '/api/sections',
    router: router
};
