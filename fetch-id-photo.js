var request = require('request');

var config = require('./config');

var fetchIDPhoto = function(uin, callback) {
    console.log("Fetching ID photo for " + uin);
    var url = 'https://my.cs.illinois.edu/classtools/viewphoto.asp?uin=' + uin;

    var jar = request.jar();
    jar.setCookie(request.cookie(config.myCSSessionCookie), url);

    request({
        url: url,
        jar: jar,
        headers: {
            'Referer': 'https://my.cs.illinois.edu/classtools/viewroster.asp'
        },
        encoding: null
    }, callback);
};

module.exports = fetchIDPhoto;
