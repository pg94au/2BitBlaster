var debug = require('debug')('Blaster:Level');
var util = require('util');

function Level(waves) {
    debug('Level constructor');
    if (waves === undefined) {
        throw new Error('waves cannot be undefined');
    }
    this._active = true;
    this._currentWave = 0;
    this._waves = waves;
}

Level.prototype.isActive = function() {
    return this._active;
};

Level.prototype.tick = function () {
    debug('Level.tick');

    if (this._currentWave < this._waves.length) {
        this._waves[this._currentWave].tick();

        if (!this._waves[this._currentWave].isActive()) {
            this._currentWave++;
        }
    }
    else {
        this._active = false;
    }
};

module.exports = Level;