var _ = require('underscore');
var debug = require('debug')('Blaster:SecondWave');

var Point = require('../Point').Point;
var Probe = require('../enemies/Probe').Probe;

function SecondWave(audioPlayer, world, clock) {
    debug('SecondWave constructor');
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
    this._numberOfEnemiesLeftToDeploy = 10;
}

SecondWave.prototype.isActive = function() {
    return (this._numberOfEnemiesLeftToDeploy > 0)
        || (this._world.getActiveEnemies().length > 0)
        || (this._world.getActiveExplosions().length > 0);
};

SecondWave.prototype.tick = function() {
    debug('SecondWave.tick');

    //TODO: This is just a simple demonstration of how a wave can manage adding enemies to the world.
    if (this._numberOfEnemiesLeftToDeploy > 0) {
        if ((this._addNextEnemyAt <= new Date()) && (this._world.getActiveEnemies().length < 5)) {
            // Space out the addition of enemies.
            this._addNextEnemyAt = new Date();
            this._addNextEnemyAt.setSeconds(this._addNextEnemyAt.getSeconds() + 1);

            var probeStartingPoint = new Point(240, -10);
            var _probe = new Probe(this._audioPlayer, this._world, this._clock, probeStartingPoint);
            this._world.addActor(_probe);

            this._numberOfEnemiesLeftToDeploy--;
        }
    }
};

module.exports = SecondWave;