var debug = require('debug')('Blaster:LevelManager');
var Enum = require('enum');
var events = require('events');

var Level = require('./Level');
var Scheduler = require('./timing/Scheduler').Scheduler;
var Text = require('./Text');
var TextInterlude = require('./TextInterlude');

var LevelState = new Enum(
    ['Intro', 'Play', 'Win']
);

function LevelManager(audioPlayer, world, clock, levels) {
    debug('LevelManager constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    if (levels === undefined) {
        throw new Error('levels cannot be undefined');
    }
    this._eventEmitter = new events.EventEmitter();
    this._audioPlayer = audioPlayer;
    this._world = world;
    this._levels = levels;
    this._currentLevel = 0;
    this._clock = clock;
    this._scheduler = new Scheduler(clock);
    this._state = LevelState.Intro;
    this._active = true;
}

LevelManager.prototype.getCurrentLevel = function() {
    return this._currentLevel + 1;
};

LevelManager.prototype.isActive = function() {
    return this._active;
};

LevelManager.prototype.on = function(e, f) {
    debug('LevelManager.on');
    this._eventEmitter.on(e, f);
    this._eventEmitter.emit('level', this._currentLevel + 1);
};

LevelManager.prototype.tick = function () {
    debug('LevelManager.tick');

    if (this._active === false) {
        return;
    }

    switch (this._state) {
        case LevelState.Intro:
            this.tickWithinLevelIntro();
            break;
        case LevelState.Play:
            this.tickWithinLevel();
            break;
        case LevelState.Win:
            this.tickWithinWinnerSequence();
            break;
        default:
            throw new Error('Unexpected state: ' + this._state);
            break;
    }

    this._scheduler.executeDueOperations();
};

LevelManager.prototype.tickWithinLevelIntro = function() {
    var self = this;

    var TIME_TO_LEVEL_TEXT_VISIBLE = 2000;
    var TIME_LEVEL_TEXT_IS_VISIBLE = 4000;
    var TIME_AFTER_LEVEL_TEXT_VISIBLE = 2000;
    if (this._textInterlude == null) {
        this._textInterlude = new TextInterlude(
            this._world, this._clock,
            "Level " + (this._currentLevel + 1),
            "50px Arial", "red",
            this._world.getDimensions().width / 2, this._world.getDimensions().height / 2,
            TIME_TO_LEVEL_TEXT_VISIBLE, TIME_LEVEL_TEXT_IS_VISIBLE, TIME_AFTER_LEVEL_TEXT_VISIBLE
        );

        setTimeout(function() {
            self._audioPlayer.play('level_start');
        }, TIME_TO_LEVEL_TEXT_VISIBLE);
    }

    this._textInterlude.tick();
    if (!this._textInterlude.isActive()) {
        this._textInterlude = null;
        this._state = LevelState.Play;
    }
};

LevelManager.prototype.tickWithinLevel = function() {
    this._levels[this._currentLevel].tick();

    if (!this._levels[this._currentLevel].isActive()) {
        if (this._currentLevel < this._levels.length-1) {
            this._currentLevel++;
            this._state = LevelState.Intro;
            this._eventEmitter.emit('level', this._currentLevel + 1);
        }
        else {
            this._state = LevelState.Win;
        }
    }
};

LevelManager.prototype.tickWithinWinnerSequence = function() {
    var self = this;

    var TIME_TO_CONGRATULATIONS_TEXT_VISIBLE = 2000;
    var TIME_CONGRATULATIONS_TEXT_IS_VISIBLE = 4000;
    var TIME_AFTER_CONGRATULATIONS_TEXT_VISIBLE = 2000;
    if (this._textInterlude == null) {
        this._textInterlude = new TextInterlude(
            this._world, this._clock,
            "CONGRATULATIONS!",
            "32px Arial", "green",
            this._world.getDimensions().width / 2, this._world.getDimensions().height / 2,
            TIME_TO_CONGRATULATIONS_TEXT_VISIBLE, TIME_CONGRATULATIONS_TEXT_IS_VISIBLE, TIME_AFTER_CONGRATULATIONS_TEXT_VISIBLE
        );

        setTimeout(function() {
            self._audioPlayer.play('congratulations');
        }, TIME_TO_CONGRATULATIONS_TEXT_VISIBLE);
    }

    this._textInterlude.tick();
    if (!this._textInterlude.isActive()) {
        this._textInterlude = null;
        this._state = LevelState.Play;
        this._active = false;
    }
};

module.exports = LevelManager;