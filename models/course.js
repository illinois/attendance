module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define('Course', {
        name: DataTypes.STRING,
        isArchived: {type: DataTypes.BOOLEAN, defaultValue: false}
    }, {
        classMethods: {
            associate: function(models) {
                Course.hasMany(models.User);
                Course.hasMany(models.Section);
            }
        }
    });
    return Course;
};
