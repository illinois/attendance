module.exports = function(sequelize, DataTypes) {
    var Section = sequelize.define('Section', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Section.belongsTo(models.Course);
                Section.hasMany(models.Checkin);
                Section.hasMany(models.Comment);
            }
        },
        instanceMethods: {
            /**
             * Checks if the given user has permission to view the course this
             * section belongs to.
             *
             * Parameters:
             *   user: User instance
             *   done: function(err, result)
             *     - result: true if user has access to the course this
             *       section belongs to, false otherwise.
             */
            hasUser: function(user, done) {
                this.getCourse()
                .success(function(course) {
                    course.hasUser(user).done(done);
                });
            }
        }
    });
    return Section;
};
