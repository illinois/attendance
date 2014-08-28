module.exports = function(sequelize, DataTypes) {
    var Section = sequelize.define('Section', {
        name: DataTypes.STRING,
        notes: {type: DataTypes.TEXT, defaultValue: ''}
    }, {
        classMethods: {
            associate: function(models) {
                Section.belongsTo(models.Course);
                Section.hasMany(models.Checkin);
            }
        }
    });
    return Section;
};
