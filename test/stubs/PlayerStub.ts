import {Bounds} from "../../src/Bounds";
import {Player} from "../../src/Player";
import {Point} from "../../src/Point";
import {World} from "../../src/World";

import {AudioPlayerStub} from "./AudioPlayerStub";
import {ClockStub} from "./ClockStub";
import {JoystickStub} from "./JoystickStub";
import {Actor} from "../../src/Actor";

export class PlayerStub extends Player {
    private _ignoreHits: boolean = false;
    private _onHit: (damage: number) => void = damage => {};
    private _onTick: () => void = () => {};

    constructor(world: World, startingPoint: Point) {
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

    hitBy(shot: Actor, damage: number): boolean {
        this._onHit(damage);
        return !this._ignoreHits;
    }

    onTick(value: () => void): PlayerStub {
        this._onTick = value;
        return this;
    }

    tick(): void {
        this._onTick();
    }
}