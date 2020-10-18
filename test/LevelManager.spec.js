var _ = require('underscore');
var expect = require('chai').expect;

var LevelManager = require('../src/LevelManager');

var AudioPlayerStubBuilder = require('./builders/AudioPlayerStubBuilder');
var ClockStubBuilder = require('./builders/ClockStubBuilder');
var WorldStubBuilder = require('./builders/WorldStubBuilder');

describe('LevelManager', function() {
    describe('#ctor()', function () {
        it('starts in an active state', function () {
            var levelManager = new LevelManager({}, {}, {}, []);
            expect(levelManager.isActive()).to.be.true;
        });

        it('starts at level one', function() {
            var levelManager = new LevelManager({}, {}, {}, []);
            expect(levelManager.getCurrentLevel()).to.be.equal(1);
        });
    });

    describe('#on()', function() {
        it('immediately emits a level event', function() {
            var levelUpdate = null;
            var levelManager = new LevelManager({}, {}, {}, []);
            levelManager.on('level', function(currentLevel) {
                levelUpdate = currentLevel;
            });
            expect(levelUpdate).to.be.equal(levelManager.getCurrentLevel());
        });
    });

    describe('#tick()', function() {
        it('starts with a delay before level text is displayed', function() {
            var textAdded = false;
            var level1 = {
                isActive: function() { return true; },
                tick: function() {}
            };
            var clock = new ClockStubBuilder().build();
            var world = new WorldStubBuilder().build();
            world.addText = function(text) { textAdded = true; };
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick();
            levelManager.tick();
            expect(textAdded).to.be.false;
        });

        it ('displays level text after an initial delay', function() {
            var textAdded = false;
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var world = new WorldStubBuilder().build();
            world.addText = function(text) { textAdded = true; };
            var levelManager = new LevelManager(audioPlayer, world, clock, [{}]);
            levelManager.tick(); // Tick to schedule text display.
            clock.addSeconds(3);
            levelManager.tick(); // Tick to display text.
            expect(textAdded).to.be.true;
        });

        it('removes level text after a delay', function() {
            var addedText = undefined;
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var world = new WorldStubBuilder().build();
            world.addText = function(text) { addedText = text; };
            var levelManager = new LevelManager(audioPlayer, world, clock, [{}]);
            levelManager.tick(); // Tick to schedule text display.
            clock.addSeconds(3);
            levelManager.tick(); // Tick to display text.
            clock.addSeconds(6);
            levelManager.tick();
            expect(addedText.isActive()).to.be.false;
            expect(levelManager._textInterlude).to.be.null;
        });

        it('starts calling tick with the first level after level intro completes', function() {
            var level1Ticked = false;
            var level1 = {
                isActive: function() { return true; },
                tick: function() { level1Ticked = true; }
            };
            var clock = new ClockStubBuilder().build();
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks first level.
            expect(level1Ticked).to.be.true;
        });

        it ('switches to ticking the next level after each level becomes inactive', function() {
            var level2Ticked = false;
            var level1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var level2 = {
                isActive: function() { return true; },
                tick: function() { level2Ticked = true; }
            };
            var clock = new ClockStubBuilder().build();
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1, level2]
            );
            // Tick through first level before we get to the second.
            _.times(2, function(n) {
                levelManager.tick(); // Schedules intro.
                clock.addSeconds(100);
                levelManager.tick(); // Clears intro.
                levelManager.tick(); // Ticks new level.
            });

            expect(level2Ticked).to.be.true;
        });

        it('emits a level event when a new level is reached', function() {
            var levelFromEvent = null;
            var level1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var level2 = {
                isActive: function() { return true; },
                tick: function() { }
            };
            var clock = new ClockStubBuilder().build();
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1, level2]
            );
            levelManager.on('level', function(currentLevel) { levelFromEvent = currentLevel; });
            // Tick through first level before we get to the second.
            _.times(2, function(n) {
                levelManager.tick(); // Schedules intro.
                clock.addSeconds(100);
                levelManager.tick(); // Clears intro.
                levelManager.tick(); // Ticks new level.
            });
            expect(levelFromEvent).to.be.equal(2);
        });

        it('starts the game win sequence after there are no more levels left', function() {
            var level1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var clock = new ClockStubBuilder().build();
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks level.
            expect(levelManager._state).to.be.equal(LevelManager.States.Win);
        });

        it('removes game win text and becomes inactive when the game win sequence ends', function() {
            var level1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var clock = new ClockStubBuilder().build();
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks level and enables game win sequence.
            levelManager.tick(); // Schedules game win sequence.
            clock.addSeconds(100);
            levelManager.tick(); // Ends game win sequence and de-activates.
            expect(levelManager.isActive()).to.be.false;
            expect(levelManager._textInterlude).to.be.null;
        });

        it('does not emit a next level event when the last level is complete', function() {
            var level1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var levelUpdate = null;

            var clock = new ClockStubBuilder().build();
            var levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.on('level', function(currentLevel) {
                levelUpdate = currentLevel;
            });
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks new level (no more levels).
            expect(levelUpdate).to.be.equal(1);
        });
    });
});