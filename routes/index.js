var fs = require('fs');
var path = require('path');

var baseUrl = require('../baseurl');

module.exports = function(app) {
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach(function(file) {
        var namespace = require(path.join(__dirname, file));
        var prefix = path.join(baseUrl, namespace.prefix);
        app.use(prefix, namespace.router);
    });
};
