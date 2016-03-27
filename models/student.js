module.exports = function(sequelize, DataTypes) {
    var Student = sequelize.define('student', {
        courseId: {type: DataTypes.INTEGER, unique: 'compositeIndex'},
        uin: {type: DataTypes.STRING, unique: 'compositeIndex'},
        netid: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Student.belongsTo(models.Course);
            }
        },
        getterMethods: {
            fullName: function() {
                return this.firstName + ' ' + this.lastName;
            }
        }
    });
    return Student;
};
