import {Direction} from "./Direction";

export class DirectionState {
    private static _eventCounter: number = 0;
    private readonly _direction: Direction;
    private _isActive: boolean = false;
    private _eventNumber: number = 0;

    constructor(direction: Direction) {
        this._direction = direction;
    }

    get direction(): Direction {
        return this._direction;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get eventNumber(): number {
        return this._eventNumber;
    }

    set active(state: boolean) {
        if (this._isActive !== state) {
            this._isActive = state;
            this._eventNumber = ++DirectionState._eventCounter;
        }
    }
}
