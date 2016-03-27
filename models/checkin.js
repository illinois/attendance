module.exports = function(sequelize, DataTypes) {
    var Checkin = sequelize.define('checkin', {
        uin: {type: DataTypes.STRING, unique: 'compositeIndex'},
        sectionId: {type: DataTypes.INTEGER, unique: 'compositeIndex'}
    }, {
        classMethods: {
            associate: function(models) {
                Checkin.belongsTo(models.Section);
                Checkin.belongsTo(models.User);
            }
        }
    });
    return Checkin;
};
