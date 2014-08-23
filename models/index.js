var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('underscore');
var sequelize = new Sequelize('attendance', 'root', null, {logging: false});
var db = {};

fs
.readdirSync(__dirname)
.filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
})
.forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

module.exports = _.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);
