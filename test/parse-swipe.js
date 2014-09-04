var parseSwipe = require('../parse-swipe');

describe('parseSwipe()', function() {
    it('should handle 16-digit card numbers', function(done) {
        var uin = parseSwipe('6397600000001000');
        uin.should.equal('600000001');
        done();
    });

    it('should handle raw track 2 data', function(done) {
        var uin = parseSwipe(';6397600000002000=12345678901?');
        uin.should.equal('600000002');
        done();
    });

    it('should handle UINs directly', function(done) {
        var uin = parseSwipe('600000003');
        uin.should.equal('600000003');
        done();
    });

    it('should fail on invalid data', function(done) {
        (parseSwipe(null) === null).should.be.true;
        (parseSwipe('') === null).should.be.true;
        (parseSwipe('klwang3') === null).should.be.true;
        (parseSwipe('60000000') === null).should.be.true;
        (parseSwipe('6000000000') === null).should.be.true;
        (parseSwipe('abcdefghi') === null).should.be.true;
        done();
    });
});
