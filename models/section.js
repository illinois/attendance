module.exports = function(sequelize, DataTypes) {
    var Section = sequelize.define('section', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Section.belongsTo(models.Course);
                Section.hasMany(models.Checkin);
                Section.hasMany(models.Comment);
            },
            /**
             * Find the section and check whether the user is allowed to view
             * the course the section belongs to. Returns two arguments:
             *   - section: Section object or null if not found
             *   - allowed: Whether or not user is allowed to view the course
             */
            findForUser: function(options, user) {
                return Section.find(options).then(function(section) {
                    return [section, section ? section.hasUser(user) : null];
                });
            }
        },
        instanceMethods: {
            /**
             * Checks if the given user has permission to view the course this
             * section belongs to.
             */
            hasUser: function(user) {
                return this.getCourse().then(function(course) {
                    return course.hasUser(user);
                });
            }
        }
    });
    return Section;
};
