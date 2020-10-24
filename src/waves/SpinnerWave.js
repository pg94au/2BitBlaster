var _ = require('underscore');
var debug = require('debug')('Blaster:SpinnerWave');
var util = require('util');

var Bomber = require('../enemies/Bomber');
var Point = require('../Point').Point;
var Spinner = require('../enemies/Spinner');
var Scheduler = require('../timing/Scheduler').Scheduler;

function SpinnerWave(audioPlayer, world, clock) {
    debug('SpinnerWave constructor');
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
    this._numberOfBombersLeftToDeploy = 5;
    this._currentBomber = null;
    this._scheduler = new Scheduler(clock);
}

SpinnerWave.prototype.isActive = function() {
    return (this._numberOfSpinnersLeftToDeploy > 0)
        || (this._world.getActiveEnemies().length > 0)
        || (this._world.getActiveExplosions().length > 0);
};

SpinnerWave.prototype.tick = function() {
    debug('SpinnerWave.tick');

    if (this._numberOfSpinnersLeftToDeploy > 0) {
        this._scheduler.scheduleOperation('deploySpinner', 250, _.bind(this.deploySpinner, this));
    }

    // Limit the number of bombers so the player can't just sit and pick them off forever.
    if (this._numberOfBombersLeftToDeploy > 0) {
        // To consider scheduling the addition of a bomber, there can't already be an active one.
        if ((this._currentBomber === null) || (!this._currentBomber.isActive())) {
            // Additionally, bombers will only be scheduled if other enemies are still active.
            if (this._world.getActiveEnemies().length > 0) {
                this._scheduler.scheduleOperation('deployBomber', 10000, _.bind(this.deployBomber, this));
            }
        }
    }

    this._scheduler.executeDueOperations();
};

SpinnerWave.prototype.deploySpinner = function() {
    debug('SpinnerWave.deploySpinner');

    var worldDimensions = this._world.getDimensions();
    var spinnerStartX = worldDimensions.width / 2;
    var spinnerStartY = -20;
    var leftSpinner = new Spinner(this._audioPlayer, this._world, this._clock, new Point(spinnerStartX - 40, spinnerStartY), 1, Spinner.Bias.Left);
    this._world.addActor(leftSpinner);
    var rightSpinner = new Spinner(this._audioPlayer, this._world, this._clock, new Point(spinnerStartX + 40, spinnerStartY), 1, Spinner.Bias.Right);
    this._world.addActor(rightSpinner);

    this._numberOfSpinnersLeftToDeploy-=2;
};

SpinnerWave.prototype.deployBomber = function() {
    debug('SpinnerWave.deployBomber');

    var worldDimensions = this._world.getDimensions();
    var bomberStartY = Math.floor(_.random(50, worldDimensions.height / 2));
    var bomber = new Bomber(this._audioPlayer, this._world, this._clock, bomberStartY);
    this._currentBomber = bomber;
    this._world.addActor(bomber);

    this._numberOfBombersLeftToDeploy--;
};

module.exports = SpinnerWave;