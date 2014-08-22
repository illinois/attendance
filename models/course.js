var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define('Course', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Course.hasMany(models.User);
                Course.hasMany(models.Section);
            }
        },
        instanceMethods: {
            getCheckinCounts: function(done) {
                var query = (
                    'SELECT netid, COUNT(DISTINCT SectionId) AS count ' +
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
    return Course;
};
