var db = require('./models');

/**
 * Extract UIN from i-card track 2 data.
 *
 * Handles:
 *   - 16-digit card numbers
 *   - Raw track 2 data
 *   - Raw UINs
 *
 * Returns null if swipe data is invalid.
 */
var extractUIN = function(swipeData) {
    var re = /(?:6397(6\d{8})\d{3}|(^6\d{8}$))/;
    var result = re.exec(swipeData);

    // result === null: invalid data
    // result[1]: got UIN from (string containing) 16-digit card number
    // result[2]: got UIN from raw UIN
    var uin = result ? result[1] || result[2] : null;

    return uin;
};

/**
 * Search imported course roster for student with given NetID, and return the
 * student's UIN if found.
 */
var getUINfromNetID = function(swipeData, courseId, callback) {
    db.Student.find({
        where: {CourseId: courseId, netid: swipeData}
    })
    .success(function(student) {
        if (student) {
            callback(student.uin);
        } else {
            callback(null);
        }
    });
};

/**
 * Get UIN from swipe data or NetID and course ID.
 *
 * Syntax: parseSwipe(swipeData [, courseId ], callback)
 * If courseId is omitted, does not run NetID check.
 */
var parseSwipe = function(swipeData, courseId, callback) {
    if (typeof courseId === 'function') {
        callback = courseId;
        callback(extractUIN(swipeData));
    } else {
        var uin = extractUIN(swipeData);
        if (uin) {
            callback(uin);
        } else {
            getUINfromNetID(swipeData, courseId, callback);
        }
    }
};

module.exports = parseSwipe;
