var debug = require('debug')('Blaster:LinePath');

var Action = require('./Action');

function LinePath(template) {
    debug('LinePath constructor');
    if (template === undefined) {
        throw new Error('template cannot be undefined');
    }
    this._start = template.start;
    this._end = template.end;
    this._actions = template.actions;
}

LinePath.prototype.getPath  = function(numberOfSteps) {
    if (numberOfSteps === undefined) {
        throw new Error('numberOfSteps cannot be undefined');
    }

    var path = [];

    var stepSize = 1.0 / numberOfSteps;
    for (var currentStep = 0; currentStep <= numberOfSteps; currentStep++) {
        var t = currentStep * stepSize;
        var x = this._start[0] + Math.round((this._end[0] - this._start[0]) * t);
        var y = this._start[1] + Math.round((this._end[1] - this._start[1]) * t);
        var pathEntry = {
            action: Action.Move,
            location: [x, y]
        }
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

module.exports = LinePath;
