import {Bounds} from "../../src/Bounds";
import {Shot} from '../../src/shots/Shot';
import {Point} from "../../src/Point";

import {ExplosionProperties} from "../../src/ExplosionProperties";

export class ShotStub extends Shot {
    private _collisionMask: Bounds[] = [new Bounds(-1, 1, -1, 1)];
    private _onHit: (damage: number) => void = damage => {};
    private _ignoreHits: boolean = false;
    private _damageInflicted: number = 1;

    constructor(world: any, startingPoint: Point) {
        super(world, startingPoint);
    }

    hitBy(shot: any, damage: number): boolean {
        this._onHit(damage);
        return !this._ignoreHits;
    }

    setCollisionMask(collisionMask: Bounds[]): ShotStub {
        this._collisionMask = collisionMask;
        return this;
    }

    getCollisionMask(): Bounds[] {
        return this._collisionMask;
    }

    setDamageInflicted(damageInflicted: number): ShotStub {
        this._damageInflicted = damageInflicted;
        return this;
    }

    getDamageAgainst(actor: any): number {
        return this._damageInflicted;
    }

    getExplosionProperties(): ExplosionProperties {
        throw new Error('Not implemented');
    }

    getScoreTotal(): number {
        throw new Error('Not implemented');
    }
}