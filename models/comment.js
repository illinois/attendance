module.exports = function(sequelize, DataTypes) {
    var Comment = sequelize.define('comment', {
        text: DataTypes.TEXT
    });
    Comment.associate = function(models) {
        Comment.belongsTo(models.User);
        Comment.belongsTo(models.Section);
    };
    return Comment;
};
