import {Player} from "../../src/Player";
import {JoystickStub} from "./JoystickStub";
import {AudioPlayerStub} from "./AudioPlayerStub";
import {Point} from "../../src/Point";
import {Bounds} from "../../src/Bounds";
import {ClockStub} from "./ClockStub";

export class PlayerStub extends Player {
    private _ignoreHits: boolean = false;
    private _onHit: (damage: number) => void = damage => {};

    constructor(world: any, startingPoint: Point) {
        super(
            new JoystickStub(),
            new AudioPlayerStub(),
            world,
            startingPoint,
            new Bounds(0, 480, 0, 640),
            new ClockStub()
        );
    }

    ignoreHits(): PlayerStub {
        this._ignoreHits = true;
        return this;
    }

    onHit(value: (damage: number) => void): PlayerStub {
        this._onHit = value;
        return this;
    }

    hitBy(shot: any, damage: number): boolean {
        this._onHit(damage);
        return !this._ignoreHits;
    }
}