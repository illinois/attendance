module.exports = function(sequelize, DataTypes) {
    var Checkin = sequelize.define('Checkin', {
        uin: {type: DataTypes.STRING, unique: 'compositeIndex'},
        SectionId: {type: DataTypes.INTEGER, unique: 'compositeIndex'}
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
