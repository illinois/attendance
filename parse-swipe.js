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
var parseSwipe = function(swipeData) {
    var re = /(?:6397(6\d{8})\d{3}|(^6\d{8}$))/;
    var result = re.exec(swipeData);

    // result === null: invalid data
    // result[1]: got UIN from (string containing) 16-digit card number
    // result[2]: got UIN from raw UIN
    var uin = result ? result[1] || result[2] : null;

    return uin;
};

module.exports = parseSwipe;
