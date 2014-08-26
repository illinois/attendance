/**
 * Extract UIN from i-card track 2 data.
 *
 * Returns null if swipe data is invalid.
 */
var parseSwipe = function(swipeData) {
    var re = /;6397(\d{9})\d{3}=\d{11}\?/;
    var result = re.exec(swipeData);
    return result ? result[1] : null;
};

module.exports = parseSwipe;
