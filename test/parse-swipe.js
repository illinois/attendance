var parseSwipe = require('../parse-swipe');
var async = require('async');

describe('parseSwipe()', function() {
    it('should handle 16-digit card numbers', function(done) {
        parseSwipe('6397600000001000', function(uin) {
            uin.should.equal('600000001');
            done();
        });
    });

    it('should handle raw track 2 data', function(done) {
        parseSwipe(';6397600000002000=12345678901?', function(uin) {
            uin.should.equal('600000002');
            done();
        });
    });

    it('should handle UINs directly', function(done) {
        parseSwipe('600000003', function(uin) {
            uin.should.equal('600000003');
            done();
        });
    });

    it('should fail on invalid data', function(done) {
        var testInputs = [null, '', 'klwang3', '60000000', '6000000000', 'abcdefghi'];
        async.each(testInputs, function(input, callback) {
            parseSwipe(input, function(uin) {
                (uin === null).should.be.true;
                callback();
            });
        }, function(err) {
            done();
        });
    });
});
