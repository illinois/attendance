module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        netid: {type: DataTypes.STRING, unique: true}
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Course);
            }
        },
        setterMethods: {
            netid: function(netid) {
                return this.setDataValue('netid', netid.toLowerCase());
            }
        }
    });
    return User;
};
