var expect = require('chai').expect;

var Clock = require('../../src/timing/Clock').Clock;
var Explosion = require('../../src/Explosion').Explosion;
var Point = require('../../src/Point').Point;
var Saucer = require('../../src/enemies/Saucer').Saucer;
var ScoreCounter = require('../../src/ScoreCounter').ScoreCounter;
var World = require('../../src/World');
var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');

describe('Saucer', function() {
    describe('#hitBy()', function () {
        it('should return true', function () {
            var saucer = new Saucer({}, {}, new Clock(), new Point(5, 10));
            expect(saucer.hitBy({}, 1)).to.be.true;
        });
    });

    describe('#tick()', function () {
        it('should de-activate after health reaches zero', function() {
            var saucer = new Saucer(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, new ScoreCounter()),
                new Clock(),
                new Point(5, 10));
            saucer.hitBy({}, 1);
            saucer.tick();
            expect(saucer.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', function() {
            var saucer = new Saucer(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, new ScoreCounter()),
                new Clock(),
                new Point(5, 10));
            saucer.hitBy({}, 0.5);
            saucer.tick();
            expect(saucer.isActive()).to.be.true;
        });

        it('should add an explosion when it is destroyed', function() {
            var world = new World(480, 640, new ScoreCounter());
            var saucer = new Saucer(
                new AudioPlayerStubBuilder().build(),
                world,
                new Clock(),
                new Point(5, 10));
            saucer.hitBy({}, 1);
            saucer.tick();
            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', function() {
            var scoreCounter = new ScoreCounter();
            var saucer = new Saucer(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, scoreCounter),
                new Clock(),
                new Point(5, 10));
            saucer.hitBy({}, 1);
            saucer.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
