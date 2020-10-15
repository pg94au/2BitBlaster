var expect = require('chai').expect;

var Clock = require('../src/timing/Clock').Clock;
var Game = require('../src/Game');

var AudioPlayerStubBuilder = require('./builders/AudioPlayerStubBuilder');
var ClockStubBuilder = require('./builders/ClockStubBuilder');
var JoystickStubBuilder = require('./builders/JoystickStubBuilder');
var RendererStubBuilder = require('./builders/RendererStubBuilder');

describe('Game', function() {
    // Prevent the animation loop from running when the game is started.
    global.requestAnimationFrame = function(callback) {};

    describe('#start()', function () {
        it('should begin game with score of zero', function () {
            var initialScore = null;
            var clock = new Clock();
            var joystick = new JoystickStubBuilder().build();
            var renderer = new RendererStubBuilder().build();
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var game = new Game(joystick, renderer, audioPlayer, clock);
            game.on('score', function(currentScore) { initialScore = currentScore; });
            game.start();
            expect(initialScore).to.be.equal(0);
        });

        it('should indicate the initial number of remaining lives', function() {
            var initialRemainingLives = null;
            var clock = new Clock();
            var joystick = new JoystickStubBuilder().build();
            var renderer = new RendererStubBuilder().build();
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var game = new Game(joystick, renderer, audioPlayer, clock);
            game.on('remainingLives', function(remainingLives) { initialRemainingLives = remainingLives; });
            game.start();
            expect(initialRemainingLives).to.be.not.null;
        });
    });

    describe('#ticker()', function() {
        it('should decrement the number of remaining lives when the player is killed', function() {
            var initialRemainingLives = null;
            var currentRemainingLives = null;
            var clock = new ClockStubBuilder().build();
            var joystick = new JoystickStubBuilder().build();
            var renderer = new RendererStubBuilder().build();
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var game = new Game(joystick, renderer, audioPlayer, clock);
            game.on('remainingLives', function(remainingLives) { currentRemainingLives = remainingLives; });
            game.start();
            initialRemainingLives = currentRemainingLives;
            clock.addSeconds(1000);
            game.ticker(); // Tick adds player to world.
            clock.addSeconds(1000);
            game.ticker(); // Tick ensures player is now vulnerable.
            game._world.getPlayer().hitBy({}, 1000);
            game.ticker(); // Tick removes the player from the world.
            game.ticker(); // Tick notices the player gone and decrements lives remaining.
            expect(currentRemainingLives).to.be.below(initialRemainingLives);
        });
    });
});
