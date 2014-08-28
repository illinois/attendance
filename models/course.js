module.exports = function(sequelize, DataTypes) {
    var Course = sequelize.define('Course', {
        name: DataTypes.STRING
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
