import {Direction} from "../../src/devices/Direction";

const Joystick = require('../../src/devices/Joystick');

export class JoystickStub extends Joystick {
    private _currentDirection: Direction = Direction.None;
    private _fireState: boolean = false;

    setCurrentDirection(direction: Direction): typeof Joystick {
        this._currentDirection = direction;
        return this;
    }

    getCurrentDirection(): Direction {
        return this._currentDirection;
    }

    setFireState(fireState: boolean): typeof Joystick {
        this._fireState = fireState;
        return this;
    }

    getFireState(): boolean {
        return this._fireState;
    }
}