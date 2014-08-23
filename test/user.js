var db = require('../models');
var should = require('should');

describe('User', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).complete(done);
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.User.create({netid: 'klwang3'})
            .done(done);
        });

        it('should save NetID in lowercase', function(done) {
            db.User.create({netid: 'DOWNCASE'})
            .done(function(err, user) {
                if (err) return done(err);
                user.netid.should.equal('downcase');
                done();
            });
        });

        it('should have many Courses', function(done) {
            db.User.create({netid: 'staff1'})
            .done(function(err, user) {
                if (err) return done(err);
                db.Course.create({name: 'CS 225'})
                .done(function(err, course) {
                    if (err) return done(err);
                    user.addCourse(course).done(done);
                });
            });
        });
    });
});
