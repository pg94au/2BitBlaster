import Debug from "debug";
const debug = Debug("Blaster:Timing:Clock");

export class Clock {
    constructor() {
        debug('Clock constructor');
    }

    getCurrentDate(): Date {
        return new Date();
    }
}
