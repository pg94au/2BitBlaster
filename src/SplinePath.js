var debug = require('debug')('Blaster:SplinePath');
var bspline = require('b-spline');

var Action = require('./Action');

function SplinePath(template) {
    debug('SplinePath constructor');
    if (template === undefined) {
        throw new Error('template cannot be undefined');
    }
    this._points = template.points;
    this._actions = template.actions;

    this._order = 3;
    this._knots = this.createKnots(template.points.length, this._order);
}

SplinePath.mirrorPath = function(originalPath) {
    var mirroredPath = [];
    for (var i = 0; i < originalPath.length; i++) {
        switch (originalPath[i].action) {
            case Action.Move:
                var pathEntry = {
                    action: Action.Move,
                    location: [-originalPath[i].location[0], originalPath[i].location[1]]
                };
                mirroredPath.push(pathEntry);
                break;
            case Action.Fire:
                mirroredPath.push(originalPath[i]);
                break;
        }
    }

    return mirroredPath;
};

SplinePath.translatePath = function(originalPath, xOffset, yOffset) {
    var translatedPath = [];
    for (var i = 0; i < originalPath.length; i++) {
        switch(originalPath[i].action) {
            case Action.Move:
                var currentPathEntry = JSON.parse(JSON.stringify(originalPath[i]));
                currentPathEntry.action = originalPath[i].action;
                currentPathEntry.location[0] += xOffset;
                currentPathEntry.location[1] += yOffset;
                translatedPath.push(currentPathEntry);
                break;
            case Action.Fire:
                translatedPath.push(originalPath[i]);
                break;
        }
    }

    return translatedPath;
};

SplinePath.prototype.createKnots = function(numberOfPoints, order) {
    // Knots are computed to generate a spline that is fixed to both end points, with
    // evenly distributed computed points.
    var knots = [];

    for (var i=0; i < order; i++) {
        knots.push(0);
    }

    for (var i=1; i <= numberOfPoints - order; i++) {
        knots.push(i);
    }

    for (var i=0; i < order; i++) {
        knots.push(numberOfPoints - order + 1);
    }

    return knots;
};

SplinePath.prototype.getPath  = function(numberOfSteps) {
    if (numberOfSteps === undefined) {
        throw new Error('numberOfSteps cannot be undefined');
    }

    var path = [];

    var stepSize = 1.0 / numberOfSteps;
    for (var currentStep = 0; currentStep <= numberOfSteps; currentStep++) {
        var t = currentStep * stepSize;
        var point = bspline(t, this._order - 1, this._points, this._knots);
        var pathEntry = {
            action: Action.Move,
            location: point
        };
        path.push(pathEntry);
    }

    if (this._actions) {
        for (var i = 0; i < this._actions.length; i++) {
            // Create the new action entry.
            var actionEntry = {
                action: this._actions[i][1]
            };

            // Figure out what offset to include it at.
            var stepPosition = Math.floor(numberOfSteps * this._actions[i][0]);

            // Insert it at that position.
            path.splice(stepPosition, 0, actionEntry);
        }
    }

    return path;
};

module.exports = SplinePath;

