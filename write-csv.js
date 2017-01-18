var async = require('async');
var stringify = require('csv-stringify');

/**
 * Write checkins from `checkins` to Express `res` object.
 *
 * Checkins should be an array of objects with properties sectionName, uin,
 * netid, and timestamp.
 */
var writeCSV = function(checkins, res) {
    // Set up CSV stringifier
    var stringifier = stringify();
    stringifier.on('readable', function() {
        while ((row = stringifier.read()) !== null) {
            res.write(row);
        }
    });
    stringifier.on('finish', function() {
        res.end();
    });

    // Write header to stringifier
    var header = ['section_name', 'uin', 'netid', 'timestamp', 'secret_word'];
    stringifier.write(header);

    // Write checkins to stringifier
    async.eachSeries(checkins, function(checkin, callback) {
        stringifier.write([
            checkin.sectionName,
            checkin.uin,
            checkin.netid || '',
            checkin.timestamp.toISOString(),
            checkin.secretWord
        ]);
        setImmediate(callback);
    }, function() {
        stringifier.end();
    });
};

module.exports = writeCSV;
