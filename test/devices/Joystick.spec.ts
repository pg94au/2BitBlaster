import {describe} from 'mocha';
import {expect} from 'chai';

import {Direction} from '../../src/devices/Direction';
import {Joystick} from '../../src/devices/Joystick';

const testData = [
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

describe('Joystick', () => {
    describe('#getCurrentDirection()', () => {
        // Execute all test data as individual test cases.
        for (const testInput of testData) {
            it('should should result in ' + testInput.result + ' after events [' + testInput.events + ']', () => {
                const joystick = new Joystick();

                for (const event of testInput.events) {
                    (joystick as any)[event]();
                }

                expect(joystick.getCurrentDirection()).to.be.equal(testInput.result);
            })
        }
    });

    describe('#getFireState()', () => {
        it('should start not set', () => {
            const joystick = new Joystick();
            expect(joystick.getFireState()).to.be.false;
        });
    });

    describe('#startFire()', () => {
        it('should enable fire state', () => {
            const joystick = new Joystick();
            joystick.startFire();
            expect(joystick.getFireState()).to.be.true;
        });

        it('should retain enabled fire state when called consecutively', () => {
            const joystick = new Joystick();
            joystick.startFire();
            joystick.startFire();
            expect(joystick.getFireState()).to.be.true;
        });
    });

    describe('#stopFire()', () => {
        it('should disable fire state', () => {
            const joystick = new Joystick();
            joystick.startFire();
            joystick.stopFire();
            expect(joystick.getFireState()).to.be.false;
        });

        it('should retain disabled fire state when called consecutively', () => {
            const joystick = new Joystick();
            joystick.startFire();
            joystick.stopFire();
            joystick.stopFire();
            expect(joystick.getFireState()).to.be.false;
        });
    });
});
