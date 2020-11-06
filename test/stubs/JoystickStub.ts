import {Direction} from "../../src/devices/Direction";

import {Joystick} from '../../src/devices/Joystick';

export class JoystickStub extends Joystick {
    private _currentDirection: Direction = Direction.None;
    private _currentFireState: boolean = false;

    setCurrentDirection(direction: Direction): JoystickStub {
        this._currentDirection = direction;
        return this;
    }

    getCurrentDirection(): Direction {
        return this._currentDirection;
    }

    setFireState(fireState: boolean): JoystickStub {
        this._currentFireState = fireState;
        return this;
    }

    getFireState(): boolean {
        return this._currentFireState;
    }
}