var assert = require('assert');
var expect = require('chai').expect;

var Direction = require('../../src/devices/Direction');
var Joystick = require('../../src/devices/Joystick');

//TODO: The 'equal' test on the enum produces a very bad error message if an
// expectation fails.  Comparing the 'key' property is better, but not as elegant.

var testData = [
    // No event.
    {
        events: [],
        result: Direction.None
    },
    // Single movement events.
    {
        events: ['startUp'],
        result: Direction.Up
    },
    {
        events: ['startDown'],
        result: Direction.Down
    },
    {
        events: ['startLeft'],
        result: Direction.Left
    },
    {
        events: ['startRight'],
        result: Direction.Right
    },
    // Single event followed by undo event.
    {
        events: ['startUp', 'stopUp'],
        result: Direction.None
    },
    {
        events: ['startDown', 'stopDown'],
        result: Direction.None
    },
    {
        events: ['startLeft', 'stopLeft'],
        result: Direction.None
    },
    {
        events: ['startRight', 'stopRight'],
        result: Direction.None
    },
    // Single event followed by opposite direction.
    {
        events: ['startUp', 'startDown'],
        result: Direction.Down
    },
    {
        events: ['startDown', 'startUp'],
        result: Direction.Up
    },
    {
        events: ['startLeft', 'startRight'],
        result: Direction.Right
    },
    {
        events: ['startRight', 'startLeft'],
        result: Direction.Left
    },
    // Direction followed by opposite which is then de-activated.
    {
        events: ['startUp', 'startDown', 'stopDown'],
        result: Direction.Up
    },
    {
        events: ['startDown', 'startUp', 'stopUp'],
        result: Direction.Down
    },
    {
        events: ['startLeft', 'startRight', 'stopRight'],
        result: Direction.Left
    },
    {
        events: ['startRight', 'startLeft', 'stopLeft'],
        result: Direction.Right
    },
    // Direction event which form a diagonal.
    {
        events: ['startUp', 'startLeft'],
        result: Direction.Up | Direction.Left
    },
    {
        events: ['startUp', 'startRight'],
        result: Direction.Up | Direction.Right
    },
    {
        events: ['startDown', 'startLeft'],
        result: Direction.Down | Direction.Left
    },
    {
        events: ['startDown', 'startRight'],
        result: Direction.Down | Direction.Right
    },
    // Repeated start events are ignored.
    {
        events: ['startUp', 'startUp', 'startDown', 'startUp'],
        result: Direction.Down
    }
];

describe('Joystick', function() {
    describe('#getCurrentDirection()', function() {
        // Execute all test data as individual test cases.
        testData.forEach(
            function(testInput) {
                it('should should result in ' + testInput.result.key + ' after events [' + testInput.events + ']', function() {
                    var joystick = new Joystick();

                    testInput.events.forEach(
                        function(event) {
                            joystick[event]();
                        }
                    );

                    expect(joystick.getCurrentDirection()).to.be.equal(testInput.result);
                }
            );
        });
    });

    describe('#getFireState()', function() {
        it('should start not set', function() {
            var joystick = new Joystick();
            expect(joystick.getFireState()).to.be.false;
        });
    });

    describe('#startFire()', function() {
        it('should enable fire state', function () {
            var joystick = new Joystick();
            joystick.startFire();
            expect(joystick.getFireState()).to.be.true;
        });

        it('should retain enabled fire state when called consecutively', function() {
            var joystick = new Joystick();
            joystick.startFire();
            joystick.startFire();
            expect(joystick.getFireState()).to.be.true;
        });
    });

    describe('#stopFire()', function() {
        it('should disable fire state', function() {
            var joystick = new Joystick();
            joystick.startFire();
            joystick.stopFire();
            expect(joystick.getFireState()).to.be.false;
        });

        it('should retain disabled fire state when called consecutively', function() {
            var joystick = new Joystick();
            joystick.startFire();
            joystick.stopFire();
            joystick.stopFire();
            expect(joystick.getFireState()).to.be.false;
        });
    });
});
