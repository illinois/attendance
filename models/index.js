var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('underscore');

var config = require('../config');

var NODE_ENV = process.env.NODE_ENV || 'development';

var dbConfig = config.db[NODE_ENV];
var sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        logging: dbConfig.logging
    }
);
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
