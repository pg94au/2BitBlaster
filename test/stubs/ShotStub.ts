import {Actor} from "../../src/Actor";
import {Bounds} from "../../src/Bounds";
import {ExplosionProperties} from "../../src/ExplosionProperties";
import {ImageDetails} from "../../src/ImageDetails";
import {Point} from "../../src/Point";
import {Shot} from '../../src/shots/Shot';
import {World} from "../../src/World";

export class ShotStub extends Shot {
    private _collisionMask: Bounds[] = [new Bounds(-1, 1, -1, 1)];
    private _onHit: (damage: number) => void = damage => {};
    private _ignoreHits: boolean = false;
    private _damageInflicted: number = 1;

    constructor(world: World, startingPoint: Point) {
        super(world, startingPoint);
    }

    hitBy(shot: Shot, damage: number): boolean {
        this._onHit(damage);
        return !this._ignoreHits;
    }

    setCollisionMask(collisionMask: Bounds[]): ShotStub {
        this._collisionMask = collisionMask;
        return this;
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return this._collisionMask;
    }

    setDamageInflicted(damageInflicted: number): ShotStub {
        this._damageInflicted = damageInflicted;
        return this;
    }

    getDamageAgainst(actor: Actor): number {
        return this._damageInflicted;
    }

    getExplosionProperties(): ExplosionProperties {
        throw new Error('Not implemented');
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('image_name', 1, 1, 0);
    }
}