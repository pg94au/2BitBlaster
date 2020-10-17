"use strict";

var debug = require('debug')('Blaster:Joystick');

var Direction = require('./Direction');

var Joystick = function() {
    debug('Joystick constructor');
    this._eventCounter = 0;
    this._fireState = false;
    this._up = { direction: Direction.Up, active: false, eventNumber: 0 };
    this._down = { direction: Direction.Down, active: false, eventNumber: 0 };
    this._left = { direction: Direction.Left, active: false, eventNumber: 0 };
    this._right = { direction: Direction.Right, active: false, eventNumber: 0 };
    this._directionStates = [this._up, this._down, this._left, this._right];
};

Joystick.prototype.startFire = function() {
    debug('Joystick.startFire');
    this._fireState = true;
};

Joystick.prototype.stopFire = function() {
    debug('Joystick.stopFire');
    this._fireState = false;
};

Joystick.prototype.getFireState = function() {
    return this._fireState;
};

Joystick.prototype.startUp = function() {
    debug('Joystick.startUp');
    if (!this._up.active) {
        this._up.active = true;
        this._up.eventNumber = ++this._eventCounter;
    }
};

Joystick.prototype.stopUp = function() {
    debug('Joystick.stopUp');
    this._up.active = false;
    this._up.eventNumber = ++this._eventCounter;
};

Joystick.prototype.startDown = function() {
    debug('Joystick.startDown');
    if (!this._down.active) {
        this._down.active = true;
        this._down.eventNumber = ++this._eventCounter;
    }
};

Joystick.prototype.stopDown = function() {
    debug('Joystick.stopDown');
    this._down.active = false;
    this._down.eventNumber = ++this._eventCounter;
};

Joystick.prototype.startLeft = function() {
    debug('Joystick.startLeft');
    if (!this._left.active) {
        this._left.active = true;
        this._left.eventNumber = ++this._eventCounter;
    }
};

Joystick.prototype.stopLeft = function() {
    debug('Joystick.stopLeft');
    this._left.active = false;
    this._left.eventNumber = ++this._eventCounter;
};

Joystick.prototype.startRight = function() {
    debug('Joystick.startRight');
    if (!this._right.active) {
        this._right.active = true;
        this._right.eventNumber = ++this._eventCounter;
    }
};

Joystick.prototype.stopRight = function() {
    debug('Joystick.stopRight');
    this._right.active = false;
    this._right.eventNumber = ++this._eventCounter;
};

Joystick.prototype.getCurrentDirection = function() {
    debug('Joystick.getCurrentDirection');

    // Start by considering only active directions.
    var activeDirections = this._directionStates.filter(
        function(directionState) {
            return directionState.active;
        }
    );

    // If there are active directions, determine the resulting Direction, else the direction is None.
    if (activeDirections.length > 0) {
        // Sort these by event counter so the most recent is first.
        var sortedDirections = activeDirections.sort(function(a, b) {
            return (b.eventNumber - a.eventNumber);
        });

        // Remove conflicting directions based on most recent event order.
        var directionsWithoutConflicts = removeConflictingDirectionStates(sortedDirections);

        if (directionsWithoutConflicts.length === 1) {
            // If there is only one non-conflicting direction, that is it.
            return directionsWithoutConflicts[0].direction;
        }
        else {
            // If there is more than one non-conflicting direction (there will be two),
            // then we have a diagonal direction and must calculate it.
            var first = directionsWithoutConflicts[0].direction;
            var second = directionsWithoutConflicts[1].direction;
            if (((first == Direction.Up) && (second == Direction.Left)) ||
                ((first == Direction.Left) && (second == Direction.Up))) {
                return Direction.Up | Direction.Left;
            }
            if (((first == Direction.Up) && (second == Direction.Right)) ||
                ((first == Direction.Right) && (second == Direction.Up))) {
                return Direction.Up | Direction.Right;
            }
            if (((first == Direction.Down) && (second == Direction.Left)) ||
                ((first == Direction.Left) && (second == Direction.Down))) {
                return Direction.Down | Direction.Left;
            }
            if (((first == Direction.Down) && (second == Direction.Right)) ||
                ((first == Direction.Right) && (second == Direction.Down))) {
                return Direction.Down | Direction.Right;
            }
        }
    }
    else {
        return Direction.None;
    }
};

function removeConflictingDirectionStates(directionStates) {
    var acceptedDirections = {};
    acceptedDirections[Direction.Up] = false;
    acceptedDirections[Direction.Down] = false;
    acceptedDirections[Direction.Left] = false;
    acceptedDirections[Direction.Right] = false;

    var directionStatesWithoutConflicts = directionStates.filter(
        function(directionState) {
            if (
                ((directionState.direction === Direction.Up) && !acceptedDirections[Direction.Down]) ||
                ((directionState.direction === Direction.Down) && !acceptedDirections[Direction.Up]) ||
                ((directionState.direction === Direction.Left) && !acceptedDirections[Direction.Right]) ||
                ((directionState.direction === Direction.Right) && !acceptedDirections[Direction.Left])
            ) {
                acceptedDirections[directionState.direction] = true;

                return true;
            }
            else {
                return false;
            }
        }
    );

    return directionStatesWithoutConflicts;
}

module.exports = Joystick;
