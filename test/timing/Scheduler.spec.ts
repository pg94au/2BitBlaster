import {describe} from 'mocha';
import {expect} from 'chai';

import {Clock} from '../../src/timing/Clock';
import {Scheduler} from "../../src/timing/Scheduler";

import {ClockStub} from '../stubs/ClockStub';

describe('Scheduler', () => {
    describe('#scheduleOperation()', () => {
       it('schedules an operation that has not already been scheduled', () => {
           const clock = new Clock();
           const scheduler = new Scheduler(clock);
           const result = scheduler.scheduleOperation('someTag', 0, () => {});
           expect(result).to.be.true;
       });

       it('does not schedule an operation that has already been scheduled', () => {
           const clock = new Clock();
           const scheduler = new Scheduler(clock);
           scheduler.scheduleOperation('someTag', 0, () => {});
           const result = scheduler.scheduleOperation('someTag', 0, () => {});
           expect(result).to.be.false;
       });

        it('allows an operation to be re-scheduled from inside the handler of that operation', () => {
            const clock = new ClockStub();
            const scheduler = new Scheduler(clock);

            let operationExecuted = false;
            // Schedule an initial operation...
            scheduler.scheduleOperation('someTag', 0, () => {
               // ...which, when due, will schedule another operation with the same tag
               scheduler.scheduleOperation('someTag', 0, () => {
                   operationExecuted = true;
               });
            });
            scheduler.executeDueOperations();   // Execute initial operation.
            scheduler.executeDueOperations();   // Execute new operation added during first operation.

            expect(operationExecuted).to.be.true;
        });

        describe('#executeDueOperations()', () => {
            it('does not execute scheduled operations that are not yet due', () => {
                const clock = new ClockStub();
                const scheduler = new Scheduler(clock);

                let operationExecuted = false;
                scheduler.scheduleOperation('someTag', 5000, () => {
                    operationExecuted = true;
                });
                scheduler.executeDueOperations();

                expect(operationExecuted).to.be.false;
            });

            it('executes scheduled operations that are exactly due', () => {
                const clock = new ClockStub();
                const scheduler = new Scheduler(clock);

                let operationExecuted = false;
                scheduler.scheduleOperation('someTag', 0, () => {
                   operationExecuted = true;
                });
                scheduler.executeDueOperations();

                expect(operationExecuted).to.be.true;
            });

            it ('executes scheduled operations that are past due', () => {
                const clock = new ClockStub();
                const scheduler = new Scheduler(clock);

                let operationExecuted = false;
                scheduler.scheduleOperation('someTag', 0, () => {
                    operationExecuted = true;
                });
                clock.addSeconds(5);
                scheduler.executeDueOperations();

                expect(operationExecuted).to.be.true;
            });
        });
    });
});
