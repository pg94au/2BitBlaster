var _ = require('underscore');
var debug = require('debug')('Blaster:Spinner');
var util = require('util');

var Bomb = require('../shots/Bomb');
var Enemy = require('./Enemy');
var HitArbiter = require('../HitArbiter');
var PathAction = require('../paths/PathAction').PathAction;
var PathTemplate = require('../paths/PathTemplate').PathTemplate;
var Point = require('../Point').Point;
var Scheduler = require('../timing/Scheduler').Scheduler;
var SplinePath = require('../paths/SplinePath').SplinePath;

var Bias = {
    Left: 1,
    Right: 2
};

function Spinner(audioPlayer, world, clock, startX, startY, path, bias) {
    debug('Spinner constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    if (startX === undefined) {
        throw new Error('startX cannot be undefined');
    }
    if (startY === undefined) {
        throw new Error('startY cannot be undefined');
    }
    if (path === undefined) {
        throw new Error('path cannot be undefined');
    }
    if (path < 1 || path > 2) {
        throw new Error('path value out of range');
    }
    if (bias === undefined) {
        throw new Error('bias cannot be undefined');
    }

    Enemy.apply(this, [audioPlayer, world, startX, startY]);

    this.health = 1;
    this._currentFrame = 0;
    this._scheduler = new Scheduler(clock);
    this._hitArbiter = new HitArbiter(this);

    this.advanceCurrentFrame();

    this.getExplosionProperties = function() {
        var explosionProperties = {
            imageName: 'saucer_explosion',
            numberOfFrames: 4,
            frameWidth: 80,
            frameSpeed: 0.8,
            soundName: 'saucer_explosion'
        };
        return explosionProperties;
    };

    this.getScoreTotal = function() {
        return 5;
    };

    this.calculatePaths();

    var proto = Object.getPrototypeOf(this);

    switch(bias) {
        case Bias.Left:
            this.prepareNextPath(proto._leftPathTemplates[path - 1]);
            break;
        case Bias.Right:
            this.prepareNextPath(proto._rightPathTemplates[path - 1]);
            break;
        default:
            throw new Error('Unrecognized bias argument: ' + bias);
            break;
    }
}

Spinner.Bias = Bias;

util.inherits(Spinner, Enemy);

Spinner.prototype.getCollisionMask = function() {
    return [{
        left: -30,
        right: 30,
        top: -30,
        bottom: 30
    }];
};

Spinner.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Spinner.prototype.getImageDetails = function() {
    return {
        name: 'spinner',
        numberOfFrames: 12,
        frameWidth: 80,
        currentFrame: this._currentFrame
    };
};

Spinner.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);
    return true;
};

Spinner.prototype.tick = function () {
    debug('Spinner.tick');
    Spinner.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    this.move();

//    this._scheduler.scheduleOperation('dropBomb', _.random(3000, 8000), _.bind(this.dropBomb, this));
    this.scheduleNextBombDrop();

    // Check if this spinner has collided with any active enemies.
    var player = this._world.getPlayer();
    if (player) {
        this._hitArbiter.attemptToHit(player);
    }
};

Spinner.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % 12;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 60, _.bind(this.advanceCurrentFrame, this));
};

Spinner.prototype.scheduleNextBombDrop = function() {
    // Need to bind so that 'this' in dropBomb will refer to the Spinner.
    this._scheduler.scheduleOperation('dropBombAt', _.random(2000, 4000), _.bind(this.dropBomb, this));
};

Spinner.prototype.dropBomb = function() {
    var worldCoordinates = this._world.getDimensions();

    if (this._x > 0 && this._x < worldCoordinates.width && this._y > 0 && this._y < worldCoordinates.height) {
        // Don't drop a bomb if we're too low.  Not very fair.
        if (this._y < (worldCoordinates.height / 2)) {
            var bomb = new Bomb(this._audioPlayer, this._world, this._x, this._y);
            this._world.addActor(bomb);
        }
    }
};

Spinner.prototype.move = function() {
    var self = this;

    // Choose the next path to follow once we've reach the end of the current path.
    if (this._pathPosition >= this._currentPath.length) {
        this._scheduler.scheduleOperation('resetPosition', 2000, function() {
            self._pathPosition = 0;
        });
        return;
    }

    // Follow the current path.
    switch(this._currentPath[this._pathPosition].action) {
        case PathAction.Move:
            var point = this._currentPath[this._pathPosition].location;
            this._x = point.x;
            this._y = point.y;
            break;
        case PathAction.Fire:
            this.dropBomb();
            break;
    }
    this._pathPosition++;
};

Spinner.prototype.calculatePaths  = function() {
    var proto = Object.getPrototypeOf(this);

    proto._rightPathTemplates = [
        new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-25, 100),
                new Point(0, 200), // Start of first loop
                new Point(100, 300),
                new Point(200, 200),
                new Point(100, 100),
                new Point(0, 200),
                new Point(0, 300), // Start of second loop
                new Point(100, 400),
                new Point(200, 300),
                new Point(100, 200),
                new Point(0, 300),
                new Point(0, 400), // Drop out of sight
                new Point(-100, 450),
                new Point(-150, 500),
                new Point(-225, 550),
                new Point(-225, 700),

                new Point(-350, 800),
                new Point(-350, 750),
                new Point(-350, 700),
                new Point(-350, 500),
                new Point(-200, 450),
                new Point(-150, 350),
                new Point(-150, 300),
                new Point(-50, 200),
                new Point(50, 300),
                new Point(-50, 400),
                new Point(-150, 300),
                new Point(-250, 250),
                new Point(-250, 150),
                new Point(-200, 50),
                new Point(-100, 0),
                new Point(-100, -50),
                new Point(-100, -100)
            ],
            []
        )).getPath(350),

        new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-50, 50),
                new Point(-100, 100),
                new Point(-150, 150),
                new Point(-200, 200),
                new Point(-250, 250),
                new Point(-300, 300),
                new Point(-250, 350),
                new Point(-200, 300),
                new Point(-150, 250),
                new Point(-100, 200),
                new Point(-50, 150),
                new Point(0, 100),
                new Point(50, 150),
                new Point(100, 250),
                new Point(100, 300),
                new Point(50, 400),
                new Point(-50, 450),
                new Point(-150, 350),
                new Point(-250, 300),
                new Point(-350, 200),
                new Point(-400, 100)
            ],
            []
        )).getPath(120)
    ];

    // Build mirror image path for left swoop.
    proto._leftPathTemplates = [
        SplinePath.mirrorPath(proto._rightPathTemplates[0]),
        SplinePath.mirrorPath(proto._rightPathTemplates[1])
    ];

    proto._pathsCalculated = true;
};

Spinner.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._x, this._y);
    this._pathPosition = 0;
};

module.exports = Spinner;
