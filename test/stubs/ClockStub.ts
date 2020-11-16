import {Clock} from "../../src/timing/Clock";

export class ClockStub extends Clock {
    private _currentDate: Date = new Date();

    addSeconds(seconds: number): void {
        this._currentDate.setSeconds(this._currentDate.getSeconds() + seconds);
    }

    get currentDate(): Date {
        return new Date(this._currentDate.getTime());
    }

    setCurrentDate(currentDate: Date): void {
        this._currentDate = currentDate;
    }
}