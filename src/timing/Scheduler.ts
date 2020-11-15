import Debug from "debug";
const debug = Debug("Blaster:Timing:Scheduler");
import {some} from 'underscore';
import {Clock} from './Clock';

interface ScheduleEntry {
    tag: string;
    date: Date;
    operation: () => void;
}

export class Scheduler {
    private readonly _clock: Clock;
    _scheduledItems: ScheduleEntry[];

    constructor(clock: Clock) {
        debug('Scheduler constructor');
        if (clock === undefined) {
            throw new Error('clock cannot be undefined');
        }
        this._clock = clock;
        this._scheduledItems = [];
    }

    scheduleOperation(tag: string, milliSecondsFromNow: number, operation: () => void): boolean {
        debug('scheduleOperation: tag=' + tag + ', milliSecondsFromNow=' + milliSecondsFromNow + ', operation=' + operation);
        if (some(this._scheduledItems, (item) => { return item.tag === tag; })) {
            debug('scheduleOperation: skipping duplicate tag [' + tag + ']');
            return false;
        }

        const date = this._clock.getCurrentDate();
        date.setMilliseconds(date.getMilliseconds() + milliSecondsFromNow);
        this._scheduledItems.push({ tag: tag, date: date, operation: operation });
        debug('scheduleOperation: _scheduleItems.length=' + this._scheduledItems.length);
        return true;
    }

    executeDueOperations(): void {
        debug('executeDueOperations');
        const now = this._clock.getCurrentDate();
        debug('executeDueOperations: now=' + now);
        const dueOperations: ScheduleEntry[] = [];
        const notYetDue: ScheduleEntry[] = [];
        for (let i=0; i < this._scheduledItems.length; i++) {
            if (now >= this._scheduledItems[i].date) {
                dueOperations.push(this._scheduledItems[i]);
            }
            else {
                notYetDue.push(this._scheduledItems[i]);
            }
        }
        this._scheduledItems = notYetDue;

        for (let i=0; i < dueOperations.length; i++) {
            debug('Executing scheduled operation [' + dueOperations[i].tag + ']');
            dueOperations[i].operation();
        }
        debug('executeDueOperations: At end _scheduledItems.length=' + this._scheduledItems.length);
    }
}
