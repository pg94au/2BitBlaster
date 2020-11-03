var expect = require('chai').expect;

var Clock = require('../../src/timing/Clock').Clock;
var Point = require('../../src/Point').Point;
var Probe = require('../../src/enemies/Probe').Probe;
var ScoreCounter = require('../../src/ScoreCounter').ScoreCounter;
var World = require('../../src/World');
var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');
var WorldStubBuilder = require('../builders/WorldStubBuilder');

describe('Probe', function() {
    describe('#getImageDetails', function () {
        it('should return zero frame index when probe is at full health', function() {
            var probe = new Probe({}, {}, new Clock(), new Point(5, 10));

            expect(probe.getImageDetails().currentFrame).equal(0);
        });

        it('should increment frame index as health decreases', function () {
            var probe = new Probe({}, {}, new Clock(), new Point(5, 10));
            probe._health = probe._health / 2;

            expect(probe.getImageDetails().currentFrame).above(0);
        });

        it('should not increment frame index further upon reaching zero health', function() {
            var probe = new Probe({}, {}, new Clock(), new Point(5, 10));
            probe._health = 1;
            var initialFrame = probe.getImageDetails().currentFrame;
            probe._health = 0;

            expect(probe.getImageDetails().currentFrame).to.not.be.above(initialFrame);
        });
    });

    describe('#hitBy()', function () {
        it('should return true', function () {
            var world = new WorldStubBuilder().build();
            var probe = new Probe({}, world, new Clock(), new Point(5, 10));
            expect(probe.hitBy({}, 1)).to.be.true;
        });
    });

    describe('#tick()', function () {
        it('should de-activate after health reaches zero', function() {
            var probe = new Probe(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, new ScoreCounter()),
                new Clock(),
                new Point(5, 10)
            );
            probe.hitBy({}, 3);
            probe.tick();
            expect(probe.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', function() {
            var probe = new Probe(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, new ScoreCounter()),
                new Clock(),
                new Point(5, 10)
            );
            probe.hitBy({}, 2.5);
            probe.tick();
            expect(probe.isActive()).to.be.true;
        });

        it('should add a new explosion to the world', function() {
            var world = new WorldStubBuilder().build();
            var probe = new Probe({}, world, new Clock(), new Point(5, 10));

            probe.hitBy({}, probe._health);
            probe.tick();

            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', function() {
            var scoreCounter = new ScoreCounter();
            var probe = new Probe(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, scoreCounter),
                new Clock(),
                new Point(5, 10)
            );
            probe.hitBy({}, 1000);
            probe.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
