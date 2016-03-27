var db = require('../models');
var should = require('should');

describe('User', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).then(done.bind(null, null));
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.User.create({netid: 'user1'}).then(done.bind(null, null));
        });

        it('should save NetID in lowercase', function(done) {
            db.User.create({netid: 'USER2'}).then(function(user) {
                user.netid.should.equal('user2');
                done();
            });
        });

        it('should have many Courses', function(done) {
            db.User.create({netid: 'user3'}).then(function(user) {
                return [user, db.Course.create({name: 'CS 225'})];
            }).spread(function(user, course) {
                user.addCourse(course).done(done(null, null));
            });
        });
    });
});
