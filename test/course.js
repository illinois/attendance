var db = require('../models');

describe('Course', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).then(done.bind(null, null));
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.Course.create({name: 'Test Course'})
            .then(done.bind(null, null));
        });

        it('should have many Users', function(done) {
            db.Course.create({name: 'CS 225'}).then(function(course) {
                return [course, db.User.create({netid: 'course1'})];
            }).spread(function(course, user) {
                course.addUser(user).then(done.bind(null, null));
            });
        });

        it('should have many Sections', function(done) {
            db.Course.create({name: 'CS 225'}).then(function(course) {
                return [course, db.Section.create({name: 'lab_intro'})];
            }).spread(function(course, section) {
                course.addSection(section).then(done.bind(null, null));
            });
        });
    });
});
