var expect = require('chai').expect;

var ScoreCounter = require('../src/ScoreCounter');

describe('ScoreCounter', function() {
    // Stub out high score synchronization to keep tests from making remote calls.
    ScoreCounter.prototype.synchronizeHighScore = function() {}

    describe('#ctor()', function () {
        it('starts with zero score', function () {
            var scoreCounter = new ScoreCounter();
            expect(scoreCounter.getCurrentScore()).to.be.equal(0);
        });
    });

    describe('#increment()', function() {
        it('increments the score by a specified amount', function() {
            var scoreCounter = new ScoreCounter();
            scoreCounter.increment(3);
            expect(scoreCounter.getCurrentScore()).to.be.equal(3);
        });

        it('emits a score event with the new score', function() {
            var scoreUpdate = null;
            var scoreCounter = new ScoreCounter();
            scoreCounter.on('score', function(score) { scoreUpdate = score; });
            scoreCounter.increment(3);
            expect(scoreUpdate).to.be.equal(3);
        });
    });

    describe('#on()', function() {
        it('immediately emits a score event', function() {
            var scoreUpdate = null;
            var scoreCounter = new ScoreCounter();
            scoreCounter.on('score', function(score) {
                scoreUpdate = score;
            });
            expect(scoreUpdate).to.be.equal(0);
        });
    });
});
