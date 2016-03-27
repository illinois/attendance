var db = require('../models');

describe('Section', function() {
    before(function(done) {
        db.sequelize.sync({force: true}).then(done.bind(null, null));
    });

    describe('#create()', function() {
        it('should save without error', function(done) {
            db.Section.create({name: 'lab_intro'})
            .then(done.bind(null, null));
        });

        it('should belong to a Course', function(done) {
            db.Section.create({name: 'lab_intro'}).then(function(section) {
                return [section, db.Course.create({name: 'CS 225'})];
            }).spread(function(section, course) {
                section.setCourse(course).then(done.bind(null, null));
            });
        });
    });

    describe('#hasUser()', function() {
        it('should be true if user has access to course', function(done) {
            db.Section.create({name: 'lab_intro'}).then(function(section) {
                return [section, db.Course.create({name: 'CS 225'})];
            }).spread(function(section, course) {
                return section.setCourse(course).then(function() {
                    return [section, course];
                });
            }).spread(function(section, course) {
                return [section, course, db.User.create({netid: 'section1'})];
            }).spread(function(section, course, user) {
                return course.addUser(user).then(function() {
                    return [section, user];
                });
            }).spread(function(section, user) {
                return section.hasUser(user);
            }).then(function(result) {
                result.should.be.true;
                done();
            });
        });

        it('should be false if user does not have access to course', function(done) {
            db.Section.create({name: 'lab_intro'}).then(function(section) {
                return [section, db.Course.create({name: 'CS 225'})];
            }).spread(function(section, course) {
                return section.setCourse(course).then(function() {
                    return [section, course];
                });
            }).spread(function(section, course) {
                return [section, course, db.User.create({netid: 'section2'})];
            }).spread(function(section, course, user) {
                return section.hasUser(user);
            }).then(function(result) {
                result.should.be.false;
                done();
            });
        });
    });
});
