var db = require('../models');

describe('Course', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).complete(done);
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.Course.create({name: 'Test Course'})
            .done(done);
        });

        it('should have many Users', function(done) {
            db.Course.create({name: 'CS 225'})
            .done(function(err, course) {
                if (err) return done(err);
                db.User.create({netid: 'course1'})
                .done(function(err, user) {
                    if (err) return done(err);
                    course.addUser(user).done(done);
                });
            });
        });

        it('should have many Sections', function(done) {
            db.Course.create({name: 'CS 225'})
            .done(function(err, course) {
                if (err) return done(err);
                db.Section.create({name: 'lab_intro'})
                .done(function(err, section) {
                    if (err) return done(err);
                    course.addSection(section).done(done);
                });
            });
        });
    });
});
