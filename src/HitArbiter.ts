import Debug from "debug";
import {HitResult} from "./HitResult";
import {Point} from "./Point";
import {Shot} from "./shots/Shot";
import {Actor} from "./Actor";
import {Bounds} from "./Bounds";

const debug = Debug("Blaster:HitArbiter");

export class HitArbiter {
    private readonly _shot: Shot;

    constructor(shot: Shot) {
        debug('HitArbiter constructor');
        if (shot === undefined) {
            throw new Error('shot cannot be undefined');
        }
        this._shot = shot;
    }

    attemptToHit(actor: Actor): HitResult {
        // Collision masks are relative to 0,0.
        const actorCollisionMasks = actor.getCollisionMask(this._shot);
        const shotCollisionMasks = this._shot.getCollisionMask(actor);

        const actorCoordinates: Point = actor.getCoordinates();
        const shotCoordinates: Point = this._shot.getCoordinates();

        // Offset collision masks to the current positions before testing for collision.
        const actorCollisionAreas: Bounds[] = [];
        for (const actorCollisionMask of actorCollisionMasks) {
            const actorCollisionArea = actorCollisionMask.translate(actorCoordinates);
            actorCollisionAreas.push(actorCollisionArea);
        }

        const shotCollisionAreas: Bounds[] = [];
        for (const shotCollisionMask of shotCollisionMasks) {
            const shotCollisionArea = shotCollisionMask.translate(shotCoordinates);
            shotCollisionAreas.push(shotCollisionArea);
        }

        if (this.areasCollide(actorCollisionAreas, shotCollisionAreas)) {
            const damage = this._shot.getDamageAgainst(actor);
            const hitEffective = actor.hitBy(this._shot, damage);

            if (hitEffective) {
                return HitResult.Effective;
            }
            else {
                return HitResult.Ineffective;
            }
        }
        else {
            return HitResult.Miss;
        }
    }

    areasCollide(areas1: Bounds[], areas2: Bounds[]): boolean {
        for (const area1 of areas1) {
            for (const area2 of areas2) {
                if (area1.collidesWith(area2)) {
                    return true;
                }
            }
        }

        return false;
    }
}
