var _ = require('underscore');
var debug = require('debug')('Blaster:StarField');

var Point = require('./Point').Point;
var Scheduler = require('./timing/Scheduler').Scheduler;
var Star = require('./Star');

function StarField(world, clock) {
    debug('StarField constructor');
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    this._world = world;
    this._scheduler = new Scheduler(clock);
    this._firstTick = true;
}

StarField.prototype.tick = function() {
    if (this._firstTick) {
        this.initializeStarField();
        this._firstTick = false;
        this._scheduler.scheduleOperation('addStar', _.random(500, 1000), _.bind(this.addStar, this));
    }

    // Continually add new stars to the world.
    this._scheduler.executeDueOperations();
};

StarField.prototype.initializeStarField = function() {
    // Fill the screen with stars before it starts scrolling.
    var worldDimensions = this._world.getDimensions();
    for (var y = 0; y < worldDimensions.height; y++) {
        if (_.random(1, 100) > 95) {
            var x = _.random(10, worldDimensions.width - 10);
            var star = new Star(this._world, new Point(x, y));
            this._world.addActor(star);
        }
    }
};

StarField.prototype.addStar = function() {
    var self = this;

    var x = _.random(10, this._world.getDimensions().width - 10);
    var star = new Star(self._world, new Point(x, 0));
    self._world.addActor(star);

    self._scheduler.scheduleOperation('addStar', _.random(500, 1000), _.bind(self.addStar, self));
};

module.exports = StarField;