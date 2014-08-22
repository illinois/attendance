var _ = require('underscore');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('attendance', 'root', '', {
    dialect: 'mysql',
    port: 3306
});

sequelize
.authenticate()
.complete(function(err) {
    if (!!err) {
        console.log('Unable to connect to the database:', err);
    } else {
        console.log('Connection has been established successfully.');
    }
});

var Course = sequelize.define('Course', {
    name: Sequelize.STRING
}, {
    instanceMethods: {
        getCheckinCounts: function(done) {
            var query = (
                'SELECT netid, COUNT(DISTINCT SectionId) as count ' +
                'FROM Checkins ' +
                'JOIN Sections ON Checkins.SectionId=Sections.id ' +
                'JOIN Courses ON Sections.CourseId=Courses.id ' +
                'WHERE Courses.name=? ' +
                'GROUP BY netid'
            );
            sequelize.query(query, null, {raw: true}, [this.name])
            .success(function(rows) {
                var netids = _.pluck(rows, 'netid');
                var counts = _.pluck(rows, 'count');
                var result = _.object(netids, counts);
                done(result);
            });
        }
    }
});

var User = sequelize.define('User', {
    netid: Sequelize.STRING
});

var Section = sequelize.define('Section', {
    name: Sequelize.STRING
});

var Checkin = sequelize.define('Checkin', {
    netid: Sequelize.STRING
});

Course.hasMany(Section);
Section.belongsTo(Course);

Course.hasMany(User);
User.hasMany(Course);

Section.hasMany(Checkin);
Checkin.belongsTo(Section);

sequelize
.sync({ force: true })
.complete(function(err) {
    if (!!err) {
        console.log('An error occurred while creating the table:', err);
    } else {
        console.log('It worked!');
        Course.create({name: 'CS 225'}).complete(function(err, course) {
            Section.create({name: 'lab_intro'}).complete(function(err, section) {
                section.setCourse(course).complete(function(err) {
                    Section.create({name: 'lab_debug'}).complete(function(err, _section) {
                        _section.setCourse(course).complete(function(err) {
                            Checkin.create({netid: 'klwang3'}).complete(function(err, checkin) {
                                checkin.setSection(section).complete(function(err) {
                                    Checkin.create({netid: 'klwang3'}).complete(function(err, checkin) {
                                        checkin.setSection(_section).complete(function(err) {
                                            Checkin.create({netid: 'bezault2'}).complete(function(err, checkin) {
                                                checkin.setSection(section).complete(function(err) {
                                                    Checkin.create({netid: 'bezault2'}).complete(function(err, checkin) {
                                                        checkin.setSection(section).complete(function(err) {
                                                            course.getCheckinCounts(function(counts) {
                                                                console.log(counts);
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});
