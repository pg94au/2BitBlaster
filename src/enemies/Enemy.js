/**
 * Created by paul on 2/6/2016.
 */
var debug = require('debug')('Blaster:Enemy');
var util = require('util');

var Actor = require('../Actor');
var Explosion = require('../Explosion').Explosion;

function Enemy(audioPlayer, world, startingPoint) {
    debug('Enemy constructor');
    Actor.apply(this, [world, startingPoint]);
    this._audioPlayer = audioPlayer;
}

util.inherits(Enemy, Actor);

Enemy.prototype.getExplosionProperties = function() {
    throw new Error('getExplosionProperties must be overridden');
};

Enemy.prototype.getScoreTotal = function() {
    throw new Error('getScoreTotal must be overridden');
};

Enemy.prototype.getZIndex = function() {
    return 20;
};

Enemy.prototype.tick = function () {
    debug('Enemy.tick');
    Enemy.super_.prototype.tick.call(this);

    if (this.health <= 0 || this._health <= 0) { // TODO: Consolidate this to only _health when last subclass is converted to TypeScript
        this._active = false;

        var scoreTotal = this.getScoreTotal();
        this._world.getScoreCounter().increment(scoreTotal);

        var explosionProperties = this.getExplosionProperties();
        var saucerCoordinates = this.getCoordinates();
        var saucerExplosion = new Explosion(
            explosionProperties,
            this._audioPlayer,
            this._world,
            saucerCoordinates
        );
        this._world.addActor(saucerExplosion);
    }
};

module.exports = Enemy;
