/**
 * Created by paul on 1/26/2016.
 */
var debug = require('debug')('Blaster:Shot');
var util = require('util');

var Actor = require('../Actor');

function Shot(world, startX, startY) {
    debug('Shot constructor');
    Actor.apply(this, [world, startX, startY]);
}

util.inherits(Shot, Actor);

Shot.prototype.getZIndex = function() {
    return 5;
};

Shot.prototype.tick = function () {
    debug('Shot.tick');
    Shot.super_.prototype.tick.call(this);
};

module.exports = Shot;