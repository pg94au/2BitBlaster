var _ = require('underscore');
var debug = require('debug')('Blaster:SplitterWave');
var util = require('util');

var Point = require('../Point').Point;
var Splitter = require('../enemies/Splitter');

function SplitterWave(audioPlayer, world, clock) {
    debug('SplitterWave constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }

    this._audioPlayer = audioPlayer;
    this._world = world;
    this._clock = clock;
    this._addNextEnemyAt = new Date();
    this._numberOfEnemiesLeftToDeploy = 15;
}

SplitterWave.prototype.isActive = function() {
    return (this._numberOfEnemiesLeftToDeploy > 0)
        || (this._world.getActiveEnemies().length > 0)
        || (this._world.getActiveExplosions().length > 0);
};

SplitterWave.prototype.tick = function() {
    debug('SplitterWave.tick');

    if (this._numberOfEnemiesLeftToDeploy > 0) {
        // Add new enemy when the time comes, but only if a maximum allowed aren't already active.
        if ((this._addNextEnemyAt <= new Date()) && (this._world.getActiveEnemies().length < 3)) {
            // Space out the addition of enemies.
            this._addNextEnemyAt = new Date();
            this._addNextEnemyAt.setSeconds(this._addNextEnemyAt.getSeconds() + 1);

            var worldDimensions = this._world.getDimensions();
            var splitterStartingPoint = new Point(
                Math.floor(_.random(100 + 50, worldDimensions.width - 100 - 50)),
                -20
            );
            var _splitter = new Splitter(this._audioPlayer, this._world, this._clock, splitterStartingPoint);
            this._world.addActor(_splitter);

            this._numberOfEnemiesLeftToDeploy--;
        }
    }
};

module.exports = SplitterWave;