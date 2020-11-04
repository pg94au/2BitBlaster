import {Bounds} from "../../src/Bounds";
import {Enemy} from '../../src/enemies/Enemy';
import {Point} from "../../src/Point";

import {AudioPlayerStub} from "./AudioPlayerStub";
import {ExplosionProperties} from "../../src/ExplosionProperties";

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

    getExplosionProperties(): ExplosionProperties {
        throw new Error('Not implemented');
    }

    getScoreTotal(): number {
        throw new Error('Not implemented');
    }
}