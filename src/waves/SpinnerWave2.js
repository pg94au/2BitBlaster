var _ = require('underscore');
var debug = require('debug')('Blaster:SpinnerWave2');
var util = require('util');

var Point = require('../Point').Point;
var Spinner = require('../enemies/Spinner');
var Scheduler = require('../timing/Scheduler').Scheduler;

function SpinnerWave2(audioPlayer, world, clock) {
    debug('SpinnerWave2 constructor');
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
    this._numberOfSpinnersLeftToDeploy = 10;
    this._scheduler = new Scheduler(clock);
}

SpinnerWave2.prototype.isActive = function() {
    return (this._numberOfSpinnersLeftToDeploy > 0)
        || (this._world.getActiveEnemies().length > 0)
        || (this._world.getActiveExplosions().length > 0);
};

SpinnerWave2.prototype.tick = function() {
    debug('SpinnerWave2.tick');

    if (this._numberOfSpinnersLeftToDeploy > 0) {
        this._scheduler.scheduleOperation('deploySpinner', 250, _.bind(this.deploySpinner, this));
    }

    this._scheduler.executeDueOperations();
};

SpinnerWave2.prototype.deploySpinner = function() {
    debug('SpinnerWave2.deploySpinner');

    var worldDimensions = this._world.getDimensions();
    var spinnerStartX = worldDimensions.width / 2;
    var spinnerStartY = -20;
    var leftSpinner = new Spinner(this._audioPlayer, this._world, this._clock, new Point(spinnerStartX - 40, spinnerStartY), 2, Spinner.Bias.Left);
    this._world.addActor(leftSpinner);
    var rightSpinner = new Spinner(this._audioPlayer, this._world, this._clock, new Point(spinnerStartX + 40, spinnerStartY), 2, Spinner.Bias.Right);
    this._world.addActor(rightSpinner);

    this._numberOfSpinnersLeftToDeploy-=2;
};

module.exports = SpinnerWave2;
