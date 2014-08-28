module.exports = function(sequelize, DataTypes) {
    var Comment = sequelize.define('Comment', {
        text: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                Comment.belongsTo(models.User);
                Comment.belongsTo(models.Section);
            }
        }
    });
    return Comment;
};
