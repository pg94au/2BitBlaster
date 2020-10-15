var Clock = require('../../src/timing/Clock').Clock;
var Joystick = require('../../src/devices/Joystick');
var Player = require('../../src/Player');
var AudioPlayerStubBuilder = require('./AudioPlayerStubBuilder');
var WorldStubBuilder = require('./WorldStubBuilder');

function PlayerStubBuilder() {
    this._startX = 5;
    this._startY = 10;
    this._audioPlayer = new AudioPlayerStubBuilder().build();
    this._world = new WorldStubBuilder().build();
}

PlayerStubBuilder.forWorld = function(world) {
    this._world = world;
    return this;
};

PlayerStubBuilder.prototype.ignoringHits = function() {
    this._ignoreHits = true;
    return this;
};

PlayerStubBuilder.prototype.withCoordinates = function(x, y) {
    this._startX = x;
    this._startY = y;
    return this;
};

PlayerStubBuilder.prototype.build = function() {
    var joystick = new Joystick();
    var clock = new Clock();
    var bounds = { minX: 0, maxX: 10, minY: 0, maxY: 20 };
    var player = new Player(joystick, this._audioPlayer, this._world, this._startX, this._startY, bounds, clock);

    var self = this;

    player.hitFor = [];
    player.hitBy = function(shot, damage) {
        this.hitFor.push(damage);
        return (self._ignoreHits === undefined);
    };

    return player;
};

module.exports = PlayerStubBuilder;
