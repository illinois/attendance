var fs = require('fs');
var cheerio = require('cheerio');
var db = require('./models');
var _ = require('lodash');

/**
 * Import roster in the format of My.CS Portal's "Export to Excel".
 *
 * callback: function(int n) where n is the number of students added.
 */
var importRoster = function(roster, courseId, callback) {
    $ = cheerio.load(roster);
    var students = [];

    $('tbody tr').each(function() {
        var row = $(this).children('td');
        students.push({
            CourseId: courseId,
            uin: row.eq(1).text(),
            netid: row.eq(0).text(),
            firstName: row.eq(4).text(),
            lastName: row.eq(3).text()
        });
    });

    students = _.uniqBy(students, 'uin');

    // Don't delete existing records if no students were found in case user
    // uploaded the wrong file.
    if (students.length === 0) return callback(null);

    db.Student.destroy({CourseId: courseId})
    .then(function() {
        db.Student.bulkCreate(students).success(function(result) {
            callback({
                count: result.length,
                lastUpdated: result[0].updatedAt
            });
        });
    });
};

module.exports = importRoster;
