var _ = require('underscore');
var debug = require('debug')('Blaster:SimpleWave');
var util = require('util');

var Point = require('../Point').Point;
var Saucer = require('../enemies/Saucer').Saucer;

function SimpleWave(audioPlayer, world, clock) {
    debug('SimpleWave constructor');
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
    this._numberOfEnemiesLeftToDeploy = 20;
}

SimpleWave.prototype.isActive = function() {
    return (this._numberOfEnemiesLeftToDeploy > 0)
        || (this._world.getActiveEnemies().length > 0)
        || (this._world.getActiveExplosions().length > 0);
};

SimpleWave.prototype.tick = function() {
    debug('SimpleWave.tick');

    //TODO: This is just a simple demonstration of how a wave can manage adding enemies to the world.
    if (this._numberOfEnemiesLeftToDeploy > 0) {
        // Add new enemy when the time comes, but only if a maximum allowed aren't already active.
        if ((this._addNextEnemyAt <= new Date()) && (this._world.getActiveEnemies().length < 5)) {
            // Space out the addition of enemies.
            this._addNextEnemyAt = new Date();
            this._addNextEnemyAt.setSeconds(this._addNextEnemyAt.getSeconds() + 1);

            var worldDimensions = this._world.getDimensions();
            var saucerStartingPoint = new Point(
                Math.floor(_.random(100 + 50, worldDimensions.width - 100 - 50)),
                -20
            );
            var _saucer = new Saucer(this._audioPlayer, this._world, this._clock, saucerStartingPoint);
            this._world.addActor(_saucer);

            this._numberOfEnemiesLeftToDeploy--;
        }
    }
};

module.exports = SimpleWave;