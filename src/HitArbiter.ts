import Debug from "debug";
import {HitResult} from "./HitResult";
import {Point} from "./Point";

const debug = Debug("Blaster:HitArbiter");

export class HitArbiter {
    private readonly _shot: any;

    constructor(shot: any) {
        debug('HitArbiter constructor');
        if (shot === undefined) {
            throw new Error('shot cannot be undefined');
        }
        this._shot = shot;
    }

    attemptToHit(actor: any): HitResult {
        // Collision masks are relative to 0,0.
        let actorCollisionMasks = actor.getCollisionMask(this._shot);
        let shotCollisionMasks = this._shot.getCollisionMask(actor);

        let actorCoordinates: Point = actor.getCoordinates();
        let shotCoordinates: Point = this._shot.getCoordinates();

        // Offset collision masks to the current positions before testing for collision.
        let actorCollisionAreas = [];
        for (let i=0; i < actorCollisionMasks.length; i++) {
            let actorCollisionArea = actorCollisionMasks[i].translate(actorCoordinates);
            actorCollisionAreas.push(actorCollisionArea);
        }

        let shotCollisionAreas = [];
        for (let i=0; i < shotCollisionMasks.length; i++) {
            let shotCollisionArea = shotCollisionMasks[i].translate(shotCoordinates);
            shotCollisionAreas.push(shotCollisionArea);
        }

        if (this.areasCollide(actorCollisionAreas, shotCollisionAreas)) {
            let damage = this._shot.getDamageAgainst(actor);
            let hitEffective = actor.hitBy(this._shot, damage);

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

    areasCollide(areas1: any, areas2: any): boolean {
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
