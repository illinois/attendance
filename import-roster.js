var fs = require('fs');
var cheerio = require('cheerio');
var db = require('./models');
var _ = require('lodash');

/**
 * Import roster in the format of My.CS Portal's "Export to Excel".
 */
var importRoster = function(roster, courseId) {
    $ = cheerio.load(roster);

    var students = $('tbody tr').map(function() {
        var row = $(this).children('td');
        return {
            courseId: courseId,
            uin: row.eq(1).text(),
            netid: row.eq(0).text(),
            firstName: row.eq(4).text(),
            lastName: row.eq(3).text()
        };
    });

    students = _.uniqBy(students, 'uin');

    // Don't delete existing records if no students were found in case user
    // uploaded the wrong file.
    if (students.length === 0) return [0, null];

    return db.Student.destroy({
        where: {courseId: courseId}
    }).then(function() {
        return db.Student.bulkCreate(students);
    }).then(function(result) {
        return [result.length, result[0].updatedAt];
    });
};

module.exports = importRoster;
