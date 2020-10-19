"use strict";

var debug = require('debug')('Blaster:TextInterlude');

var Scheduler = require('./timing/Scheduler').Scheduler;
var Text = require('./Text').Text;

var TextInterlude = function(world, clock, textContent, font, color, xPosition, yPosition,
                             preDisplayTimeInMillis, displayTimeInMillis, postDisplayTimeInMillis) {
    debug('TextInterlude constructor');
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    if (textContent === undefined) {
        throw new Error('textContent cannot be undefined');
    }
    if (font === undefined) {
        throw new Error('font cannot be undefined');
    }
    if (color === undefined) {
        throw new Error('color cannot be undefined');
    }
    if (xPosition === undefined) {
        throw new Error('xPosition cannot be undefined');
    }
    if (yPosition === undefined) {
        throw new Error('yPosition cannot be undefined');
    }
    if (preDisplayTimeInMillis === undefined) {
        throw new Error('preDisplayTimeInMillis cannot be undefined');
    }
    if (displayTimeInMillis === undefined) {
        throw new Error('displayTimeInMillis cannot be undefined');
    }
    if (postDisplayTimeInMillis === undefined) {
        throw new Error('postDisplayTimeInMillis cannot be undefined');
    }
    this._world = world;
    this._textContent = textContent;
    this._font = font;
    this._color = color;
    this._xPosition = xPosition;
    this._yPosition = yPosition;
    this._preDisplayTimeInMillis = preDisplayTimeInMillis;
    this._displaytimeInMillis = displayTimeInMillis;
    this._postDisplayTimeInMillis = postDisplayTimeInMillis;
    this._scheduler = new Scheduler(clock);
    this._active = true;
};

TextInterlude.prototype.tick = function() {
    debug('TextInterlude.tick');
    var self = this;

    var delayBeforeBecomingInactive = this._preDisplayTimeInMillis + this._displaytimeInMillis + this._postDisplayTimeInMillis;
    var delayBeforeShowingText = this._preDisplayTimeInMillis;
    var delayBeforeHidingText = this._preDisplayTimeInMillis + this._displaytimeInMillis;

    var justScheduled = this._scheduler.scheduleOperation('textInterludeEnds', delayBeforeBecomingInactive, function() {
        debug('Text interlude ending');
        self._active = false;
    });
    if (justScheduled) {
        debug('Starting text interlude');
        this._scheduler.scheduleOperation('showInterludeText', delayBeforeShowingText, function() {
            // Add interlude text.
            debug('Adding interlude text [' + self._textContent + ']');
            var worldDimensions = self._world.getDimensions();
            self._interludeText = new Text(self._textContent, self._font, self._color, self._xPosition, self._yPosition);
            self._world.addText(self._interludeText);
        });
        this._scheduler.scheduleOperation('hideInterludeText', delayBeforeHidingText, function() {
            // De-activate interlude text.
            debug('De-activating interlude text [' + self._textContent + ']');
            self._interludeText._active = false;
        });
    }

    this._scheduler.executeDueOperations();
};

TextInterlude.prototype.isActive = function() {
    debug('TextInterlude.isActive: ' + this._active);
    return this._active;
};

module.exports = TextInterlude;
