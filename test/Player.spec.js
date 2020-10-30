var expect = require('chai').expect;

var Bounds = require('../src/Bounds').Bounds;
var Clock = require('../src/timing/Clock').Clock;
var Direction = require('../src/devices/Direction').Direction;
var Player = require('../src/Player').Player;
var Point = require('../src/Point').Point;
var ScoreCounter = require('../src/ScoreCounter').ScoreCounter;
var World = require('../src/World');

var AudioPlayerStubBuilder = require('./builders/AudioPlayerStubBuilder');
var ClockStubBuilder = require('./builders/ClockStubBuilder.js');
var JoystickStubBuilder = require('./builders/JoystickStubBuilder');
var WorldStubBuilder = require('./builders/WorldStubBuilder.js');

describe('Player', function() {
    describe('#ctor()', function() {
        it('should start active', function () {
            var player = new Player({}, {}, {}, new Point(1, 2), {}, new Clock());
            expect(player.isActive()).to.be.true;
        });
    });

    describe('#hitBy()', function() {
        it('will cause visible evidence that damage was sustained when hit is successful', function() {
            var joystick = new JoystickStubBuilder().build();
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var world = new WorldStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var player = new Player(joystick, audioPlayer, world, new Point(1, 2), {}, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            player.hitBy({}, 1);

            var imageDetailsAfter = player.getImageDetails();

            expect(imageDetailsAfter.currentFrame).to.be.equal(1);
        });

        it('will only display visible evidence of damage sustained for a short period of time', function() {
            var joystick = new JoystickStubBuilder().build();
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var world = new WorldStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var player = new Player(joystick, audioPlayer, world, new Point(1, 2), {}, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            player.hitBy({}, 1);
            var imageDetailsBefore = player.getImageDetails();
            clock.addSeconds(5);
            player.tick();
            var imageDetailsAfter = player.getImageDetails();

            expect(imageDetailsAfter.currentFrame).to.be.equal(0);

        });

        it('will play a sound when damage is sustained', function() {
            var joystick = new JoystickStubBuilder().build();
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var world = new WorldStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var player = new Player(joystick, audioPlayer, world, new Point(1, 2), {}, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            player.hitBy({}, 1);

            expect(audioPlayer.getPlayedSounds()).to.be.eql(['player_hit']);
        });
    });

    describe('#on()', function() {
        it('immediately emits a health event', function() {
            var healthUpdate = null;
            var player = new Player({}, {}, {}, new Point(1, 2), {}, new Clock());
            player.on('health', function(currentHealth) {
                healthUpdate = currentHealth;
            });
            expect(healthUpdate).to.be.above(0);
        });
    });

    describe('#tick()', function() {
        it('does not move player when joystick direction is none', function() {
            var joystickMock = {
                getFireState: function() { return false; },
                getCurrentDirection: function() { return Direction.None }
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var world = new World(480, 640, new ScoreCounter());
            var bounds = {
                minX: 0,
                maxX: 20,
                minY: 0,
                maxY: 20
            };

            var player = new Player(joystickMock, audioPlayer, world, new Point(10, 10), bounds, new Clock());
            player.tick();
            expect(player.getCoordinates()).to.be.eql(new Point(10, 10));
        });

        it('moves player when joystick has direction set', function() {
            var joystickMock = {
                getFireState: function() { return false; },
                getCurrentDirection: function() { return Direction.Right }
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var world = new World(480, 640, new ScoreCounter());
            var bounds = { minX: 0, maxX: 20, minY: 0, maxY: 20 };

            var player = new Player(joystickMock, audioPlayer, world, new Point(10, 10), bounds, new Clock());
            player.tick();
            expect(player.getCoordinates().x).to.be.above(10);
        });

        [Direction.Up, Direction.Down, Direction.Left, Direction.Right].forEach(function(direction) {
            it('will not move player ' + direction.key + ' out of bounds', function () {
                var joystickMock = {
                    getFireState: function () {
                        return false;
                    },
                    getCurrentDirection: function () {
                        return direction;
                    }
                };
                var audioPlayer = new AudioPlayerStubBuilder().build();
                var world = new World(480, 640, new ScoreCounter());
                var bounds = new Bounds(10, 10, 10, 10);

                var player = new Player(joystickMock, audioPlayer, world, new Point(10, 10), bounds, new Clock());
                player.tick();
                expect(player.getCoordinates()).to.be.eql(new Point(10, 10));
            })
        });

        it('will add a new bullet to world if fire is active', function() {
            var joystickMock = {
                getFireState: function() { return true; },
                getCurrentDirection: function() { return Direction.None }
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var addedActor = null;
            var world = new World(480, 640, new ScoreCounter());
            world.addActor = function(actor) { addedActor = actor; }
            var bounds = { minX: 0, maxX: 10, minY: 0, maxY: 20 };

            var player = new Player(joystickMock, audioPlayer, world, new Point(10, 10), bounds, new Clock());
            player.tick();
            expect(addedActor).is.not.null;
        });

        it('will not allow immediate consecutive bullet to be fired', function() {
            var joystickMock = {
                getFireState: function() { return true; },
                getCurrentDirection: function() { return Direction.None }
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var addedActors = [];
            var world = new World(480, 640, new ScoreCounter());
            world.addActor = function(actor) { addedActors.push(actor); };
            var bounds = { minX: 0, maxX: 10, minY: 0, maxY: 20 };

            var player = new Player(joystickMock, audioPlayer, world, new Point(10, 10), bounds, new Clock());
            player.tick();
            player.tick();
            expect(addedActors).is.have.length(1);
        });

        it('will allow another bullet to be fired after a period of time', function() {
            var joystickMock = {
                getFireState: function() { return true; },
                getCurrentDirection: function() { return Direction.None }
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var addedActors = [];
            var world = new World(480, 640, new ScoreCounter());
            world.addActor = function(actor) { addedActors.push(actor); };
            var bounds = { minX: 0, maxX: 10, minY: 0, maxY: 20 };
            var clock = new ClockStubBuilder().build();

            var player = new Player(joystickMock, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            clock.addSeconds(1000);
            player.tick();
            expect(addedActors).is.have.length(2);
        });
    });
});
