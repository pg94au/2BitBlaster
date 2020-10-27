"use strict";

var debug = require('debug')('Blaster:Game');
var events = require('events');

var Level = require('./Level').Level;
var LevelManager = require('./LevelManager').LevelManager;
var Player = require('./Player');
var Point = require('./Point').Point;
var SecondWave = require('./waves/SecondWave');
var Scheduler = require('./timing/Scheduler').Scheduler;
var ScoreCounter = require('./ScoreCounter').ScoreCounter;
var SimpleWave = require('./waves/SimpleWave');
var SpinnerWave = require('./waves/SpinnerWave');
var SpinnerWave2 = require('./waves/SpinnerWave2');
var SplitterWave = require('./waves/SplitterWave');
var StarField = require('./StarField');
var TextInterlude = require('./TextInterlude').TextInterlude;
var World = require('./World');

var Game = function(joystick, renderer, audioPlayer, clock) {
    debug('Game constructor');
    if (joystick === undefined) {
        throw new Error('joystick cannot be undefined');
    }
    if (renderer === undefined) {
        throw new Error('renderer cannot be undefined');
    }
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    this._joystick = joystick;
    this._renderer = renderer;
    this._audioPlayer = audioPlayer;
    this._clock = clock;
    this._scheduler = new Scheduler(clock);

    var self = this;

    this._eventEmitter = new events.EventEmitter();

    this.createDisplay = function() {
        self._renderer.initialize(self._world);
    };

    this.ticker = function() {
        if (self.gameIsOver()) {
            debug('Game.ticker: The game is over.');
            self.tickWithinGameOver();
        }

        if ((self._world.getPlayer() === null) && (self._remainingLives >= 0)) {
            if (self._scheduler.scheduleOperation('resurrectPlayer', 3000, function() {
                    if (self._remainingLives >= 0) {
                        self.addPlayerToWorld();
                    }
                })) {
                self._remainingLives--;
                if (self._remainingLives >= 0) {
                    self._eventEmitter.emit('remainingLives', self._remainingLives);
                }
            }
        }

        self._scheduler.executeDueOperations();

        if (self._isActive) {
            //setTimeout(ticker, 1000/30);
            setTimeout(function() {
                global.requestAnimationFrame(self.ticker);
            }, 1000/30);
        }
        else {
            debug('ticker: Ticker stopping because game is over.');
        }

        self._starField.tick();
        self._levelManager.tick();
        self._world.tick();

        self._renderer.render();

        debug('Current joystick direction is %s', self._joystick.getCurrentDirection().toString());
    };

    this.gameIsOver = function() {
        if (!this._levelManager.active) {
            debug('Final level has been completed.');
            return true;
        }
        if (self._remainingLives === -1) {
            return true;
        }

        return false;
    };

    this.addPlayerToWorld = function() {
        var playerBounds = {
            minX: 50,
            maxX: 430,
            minY: 490,
            maxY: 590
        };
        var playerStartingPoint = new Point((playerBounds.minX + playerBounds.maxX) / 2, (playerBounds.minY + playerBounds.maxY) / 2);
        this._player = new Player(
            this._joystick,
            this._audioPlayer,
            this._world,
            playerStartingPoint,
            playerBounds,
            this._clock
        );
        this._player.on('health', function(currentHealth) {
            self._eventEmitter.emit('health', currentHealth);
        });
        this._world.addActor(this._player);
    };
};

Game.prototype.on = function(e, f) {
    this._eventEmitter.on(e, f);
};

Game.prototype.start = function() {
    debug('Game:start');
    var self = this;

    this._scheduler.scheduleOperation('resurrectPlayer', 1000, function() {
        self.addPlayerToWorld();
    });

    this._isActive = true;
    this._remainingLives = 2;
    this._eventEmitter.emit('remainingLives', this._remainingLives);

    this._scoreCounter = new ScoreCounter();
    this._scoreCounter.on('score', function(currentScore) {
        self._eventEmitter.emit('score', currentScore);
    });
    this._scoreCounter.on('highScore', function(highScore) {
        self._eventEmitter.emit('highScore', highScore);
    });

    this._world = new World(480, 640, this._scoreCounter);

    this._starField = new StarField(this._world, this._clock);

    this._levelManager = new LevelManager(
        this._audioPlayer,
        this._world,
        this._clock,
        [
            new Level([
                new SpinnerWave(this._audioPlayer, this._world, this._clock),
                new SimpleWave(this._audioPlayer, this._world, this._clock)
            ]),
            new Level([
                new SpinnerWave2(this._audioPlayer, this._world, this._clock),
                new SecondWave(this._audioPlayer, this._world, this._clock)
            ]),
            new Level([
                new SimpleWave(this._audioPlayer, this._world, this._clock),
                new SecondWave(this._audioPlayer, this._world, this._clock),
                new SplitterWave(this._audioPlayer, this._world, this._clock)
            ])
        ]
    );
    this._levelManager.on('level', function(currentLevel) {
        self._eventEmitter.emit('level', currentLevel);
    });

    this.createDisplay();
    this.ticker();
};

Game.prototype.tickWithinGameOver = function() {
    // When the game ends, text is displayed for some time before it stops
    // and the gameOver event is emitted.  This gives the user a chance to see the final
    // explosion, and few moments of the world without any player.
    if (this._textInterlude == null) {
        this._textInterlude = new TextInterlude(
            this._world, this._clock,
            "GAME OVER",
            "50px Arial", "red",
            this._world.getDimensions().width / 2, this._world.getDimensions().height / 2,
            2000, 4000, 2000
        );
    }

    this._textInterlude.tick();
    if (!this._textInterlude.active) {
        debug('Game.ticker: Emitting gameOver event.');
        this._textInterlude = null;
        this._isActive = false;
        this._eventEmitter.emit('gameOver');
        this._scoreCounter.synchronizeHighScore();
    }
};

module.exports = Game;
