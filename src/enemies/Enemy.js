/**
 * Created by paul on 2/6/2016.
 */
var debug = require('debug')('Blaster:Enemy');
var util = require('util');

var Actor = require('../Actor');
var Explosion = require('../Explosion');

function Enemy(audioPlayer, world, startX, startY) {
    debug('Enemy constructor');
    Actor.apply(this, [world, startX, startY]);
    this._audioPlayer = audioPlayer;

    this.getExplosionProperties = function() {
        throw new Error('getExplosionProperties must be overridden');
    };

    this.getScoreTotal = function() {
        throw new Error('getScoreTotal must be overridden');
    };
}

util.inherits(Enemy, Actor);

Enemy.prototype.getZIndex = function() {
    return 20;
};

Enemy.prototype.tick = function () {
    debug('Enemy.tick');
    Enemy.super_.prototype.tick.call(this);

    if (this.health <= 0) {
        this._active = false;

        var scoreTotal = this.getScoreTotal();
        this._world.getScoreCounter().increment(scoreTotal);

        var explosionProperties = this.getExplosionProperties();
        var saucerCoordinates = this.getCoordinates();
        var saucerExplosion = new Explosion(
            explosionProperties,
            this._audioPlayer,
            this._world,
            saucerCoordinates.x, saucerCoordinates.y
        );
        this._world.addActor(saucerExplosion);
    }
};

module.exports = Enemy;
