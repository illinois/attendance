module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define('course', {
        name: DataTypes.STRING,
        isArchived: {type: DataTypes.BOOLEAN, defaultValue: false}
    }, {
        classMethods: {
            associate: function(models) {
                Course.belongsToMany(models.User, {through: 'staff'});
                Course.hasMany(models.Section);
                Course.hasMany(models.Student);
            },
            /**
             * Find the course and check whether the user is allowed to view
             * the course. Returns two arguments:
             *   - course: Course object or null if not found
             *   - allowed: Whether or not user is allowed to view the course
             */
            findForUser: function(options, user) {
                return Course.find(options).then(function(course) {
                    return [course, course ? course.hasUser(user) : null];
                });
            }
        }
    });
    return Course;
};
