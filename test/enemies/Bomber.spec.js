var expect = require('chai').expect;

var Bomber = require('../../src/enemies/Bomber');
var Clock = require('../../src/timing/Clock').Clock;
var Explosion = require('../../src/Explosion');
var Point = require('../../src/Point').Point;
var ScoreCounter = require('../../src/ScoreCounter').ScoreCounter;
var World = require('../../src/World');

var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');
var WorldStubBuilder = require('../builders/WorldStubBuilder');

describe('Bomber', function() {
    describe('#hit()', function () {
        it('should return true', function () {
            var bomber = new Bomber({}, new WorldStubBuilder().build(), new Clock(), 10);
            expect(bomber.hitBy({}, 1)).to.be.true;
        });
    });

    describe('#tick()', function () {
        it('should de-activate after health reaches zero', function() {
            var bomber = new Bomber(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, new ScoreCounter()),
                new Clock(),
                10
            );
            bomber.hitBy({}, 3);
            bomber.tick();
            expect(bomber.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', function() {
            var bomber = new Bomber(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, new ScoreCounter()),
                new Clock(),
                10
            );
            bomber.hitBy({}, 0.5);
            bomber.tick();
            expect(bomber.isActive()).to.be.true;
        });

        it('should add an explosion when it is destroyed', function() {
            var addedActor = null;
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var world = new World(480, 640, new ScoreCounter());
            world.addActor = function(actor) { addedActor = actor; };
            var bomber = new Bomber(audioPlayer, world, new Clock(), 10);
            bomber.hitBy({}, 1000);
            bomber.tick();
            expect(addedActor).to.be.instanceOf(Explosion);
        });

        it('should increment the score when it is destroyed', function() {
            var scoreCounter = new ScoreCounter();
            var bomber = new Bomber(
                new AudioPlayerStubBuilder().build(),
                new World(480, 640, scoreCounter),
                new Clock(),
                10
            );
            bomber.hitBy({}, 1000);
            bomber.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });

        it('should become inactive when it disappears of the side of the screen', function() {
            var world = new WorldStubBuilder().build();
            var bomber = new Bomber({}, world, new Clock(), 10);

            var lastVisiblePosition = world.getDimensions().width + bomber.getImageDetails().frameWidth - 1;

            bomber._location = bomber._location.withX(lastVisiblePosition);

            bomber.tick();

            expect(bomber.isActive()).to.be.false;
        });
    });
});
