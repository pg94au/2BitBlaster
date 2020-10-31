import {AudioPlayerStub} from "./AudioPlayerStub";
import {Point} from "../../src/Point";
import {Bounds} from "../../src/Bounds";
const Enemy = require('../../src/enemies/Enemy');

export class EnemyStub extends Enemy {
    private _collisionMask: Bounds[] = [new Bounds(-1, 1, -1, 1)];
    private _onHit: (damage: number) => void = damage => {};
    private _ignoreHits: boolean = false;

    constructor(world: any, startingPoint: Point) {
        super(new AudioPlayerStub(), world, startingPoint);
    }

    onHit(value: (damage: number) => void): EnemyStub {
        this._onHit = value;
        return this;
    }

    hitBy(shot: any, damage: number): boolean {
        this._onHit(damage);
        return !this._ignoreHits;
    }

    refuseHits(): EnemyStub {
        this._ignoreHits = true;
        return this;
    }

    setCollisionMask(collisionMask: Bounds[]): EnemyStub {
        this._collisionMask = collisionMask;
        return this;
    }

    getCollisionMask(): Bounds[] {
        return this._collisionMask;
    }
}