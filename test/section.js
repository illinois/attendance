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
});
