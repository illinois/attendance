/**
 * Base URL of the app.
 *
 * E.g. '/' or '/attendance'
 */

// Not in config.js so that it can be shared by the server and client
var baseUrl = '/attendance';

// If the base URL is root, replace it with the empty string which is more
// useful for string concatenation.
// E.g. baseUrl + '/app.js' => '/app.js' rather than '//app.js', which is bad
module.exports = baseUrl === '/' ? '' : baseUrl;
