var Direction = require('../../src/devices/Direction');

function JoystickStubBuilder() {}

JoystickStubBuilder.prototype.build = function() {
    var self = this;

    var joystickStub = {
        getCurrentDirection: function() {return Direction.None; },
        getFireState: function() { return false; }
    };

    return joystickStub;
};

module.exports = JoystickStubBuilder;
