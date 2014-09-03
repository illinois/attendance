var db = require('../models');

describe('Section', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).complete(done);
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.Section.create({name: 'lab_intro'})
            .done(done);
        });

        it('should belong to a Course', function(done) {
            db.Section.create({name: 'lab_intro'})
            .done(function(err, section) {
                if (err) return done(err);
                db.Course.create({name: 'CS 225'})
                .done(function(err, course) {
                    if (err) return done(err);
                    section.setCourse(course).done(done);
                });
            });
        });
    });

    describe('#hasUser()', function() {
        it('should be true if user has access to course', function(done) {
            db.Section.create({name: 'lab_intro'})
            .done(function(err, section) {
                if (err) return done(err);
                db.Course.create({name: 'CS 225'})
                .done(function(err, course) {
                    if (err) return done(err);
                    section.setCourse(course)
                    .done(function(err) {
                        db.User.create({netid: 'section1'})
                        .done(function(err, user) {
                            if (err) return done(err);
                            course.addUser(user)
                            .done(function(err) {
                                if (err) return done(err);
                                section.hasUser(user, function(err, result) {
                                    if (err) return done(err);
                                    result.should.be.true;
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should be false if user does not have access to course', function(done) {
            db.Section.create({name: 'lab_intro'})
            .done(function(err, section) {
                if (err) return done(err);
                db.Course.create({name: 'CS 225'})
                .done(function(err, course) {
                    if (err) return done(err);
                    section.setCourse(course)
                    .done(function(err) {
                        db.User.create({netid: 'section2'})
                        .done(function(err, user) {
                            if (err) return done(err);
                            section.hasUser(user, function(err, result) {
                                if (err) return done(err);
                                result.should.be.false;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
