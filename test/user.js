var db = require('../models');
var should = require('should');

describe('User', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).complete(done);
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.User.create({netid: 'user1'})
            .done(done);
        });

        it('should save NetID in lowercase', function(done) {
            db.User.create({netid: 'USER2'})
            .done(function(err, user) {
                if (err) return done(err);
                user.netid.should.equal('user2');
                done();
            });
        });

        it('should have many Courses', function(done) {
            db.User.create({netid: 'user3'})
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
