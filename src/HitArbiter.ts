import Debug from "debug";
import {HitResult} from "./HitResult";

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

        let actorCoordinates = actor.getCoordinates();
        let shotCoordinates = this._shot.getCoordinates();

        // Offset collision masks to the current positions before testing for collision.
        let actorCollisionAreas = [];
        for (let i=0; i < actorCollisionMasks.length; i++) {
            let actorCollisionArea = {
                left: actorCollisionMasks[i].left + actorCoordinates.x,
                right: actorCollisionMasks[i].right + actorCoordinates.x,
                top: actorCollisionMasks[i].top + actorCoordinates.y,
                bottom: actorCollisionMasks[i].bottom + actorCoordinates.y
            };
            actorCollisionAreas.push(actorCollisionArea);
        }

        let shotCollisionAreas = [];
        for (let i=0; i < shotCollisionMasks.length; i++) {
            let shotCollisionArea = {
                left: shotCollisionMasks[i].left + shotCoordinates.x,
                right: shotCollisionMasks[i].right + shotCoordinates.x,
                top: shotCollisionMasks[i].top + shotCoordinates.y,
                bottom: shotCollisionMasks[i].bottom + shotCoordinates.y
            };
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
                if (this.singleAreasCollide(areas1[area1Index], areas2[area2Index])) {
                    return true;
                }
            }
        }

        return false;
    }

    singleAreasCollide(area1: any, area2: any): boolean {
        let collision = (
            (
                ((area1.left >= area2.left) && (area1.left <= area2.right)) ||
                ((area1.right >= area2.left) && (area1.right <= area2.right)) ||
                ((area1.left <= area2.left) && (area1.right >= area2.right)) ||
                ((area1.left >= area2.left) && (area1.right <= area2.right))
            )
            &&
            (
                ((area1.top >= area2.top) && (area1.top <= area2.bottom)) ||
                ((area1.bottom >= area2.top) && (area1.bottom <= area2.bottom)) ||
                ((area1.top <= area2.top) && (area1.bottom >= area2.bottom)) ||
                ((area1.top >= area2.top) && (area1.bottom <= area2.bottom))
            )
        );
        return collision;
    }
}
