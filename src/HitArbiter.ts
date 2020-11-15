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
        for (let i=0; i < actorCollisionMasks.length; i++) {
            const actorCollisionArea = actorCollisionMasks[i].translate(actorCoordinates);
            actorCollisionAreas.push(actorCollisionArea);
        }

        const shotCollisionAreas: Bounds[] = [];
        for (let i=0; i < shotCollisionMasks.length; i++) {
            const shotCollisionArea = shotCollisionMasks[i].translate(shotCoordinates);
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
        for (let area1Index = 0; area1Index < areas1.length; area1Index++) {
            for (let area2Index = 0; area2Index < areas2.length; area2Index++) {
                if (areas1[area1Index].collidesWith(areas2[area2Index])) {
                    return true;
                }
            }
        }

        return false;
    }
}
