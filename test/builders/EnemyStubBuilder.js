var Enemy = require('../../src/enemies/Enemy');
var Point = require('../../src/Point').Point;
var ScoreCounter = require('../../src/ScoreCounter').ScoreCounter;
var World = require('../../src/World');
var AudioPlayerStubBuilder = require('./AudioPlayerStubBuilder');

function EnemyStubBuilder() {
    this._width = 480;
    this._height = 640;
    this._startX = 1;
    this._startY = 1;
    this._collisionMask = [{ left:-1, right:1, top:-1, bottom:1 }];
    this._acceptHits = true;
}

EnemyStubBuilder.prototype.withCollisionMask = function(left, right, top, bottom) {
    this._collisionMask = [{ left:left, right:right, top:top, bottom:bottom }];
    return this;
};

EnemyStubBuilder.prototype.withCoordinates = function(x, y) {
    this._startX = x;
    this._startY = y;
    return this;
};

EnemyStubBuilder.prototype.acceptingHits = function(callback) {
    this._acceptHits = true;
    this._hitCallback = callback;
    return this;
};

EnemyStubBuilder.prototype.refusingHits = function() {
    this._acceptHits = false;
    return this;
};

EnemyStubBuilder.prototype.build = function() {
    var self = this;

    var scoreCounter = new ScoreCounter();
    var world = new World(this._width, this._height, scoreCounter);
    var audioPlayer = new AudioPlayerStubBuilder().build();
    var enemy = new Enemy(audioPlayer, world, new Point(this._startX, this._startY));

    enemy.getCollisionMask = function() { return self._collisionMask; };
    enemy.hitBy = function(shot, damage) {
        if (self._hitCallback) {
            self._hitCallback(shot, damage);
        }
        return self._acceptHits;
    };

    return enemy;
};

module.exports = EnemyStubBuilder;
