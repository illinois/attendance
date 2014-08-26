module.exports = function(sequelize, DataTypes) {
    var Checkin = sequelize.define('Checkin', {
        uin: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Checkin.belongsTo(models.Section);
            }
        }
    });
    return Checkin;
};
