var debug = require('debug')('Blaster:HitArbiter');
var Enum = require('enum');

var HitResult = new Enum(
    ['Miss', 'Ineffective', 'Effective']
);

function HitArbiter(shot) {
    debug('HitArbiter constructor');
    if (shot === undefined) {
        throw new Error('shot cannot be undefined');
    }
    this._shot = shot;
}

HitArbiter.HitResult = HitResult;

HitArbiter.prototype.attemptToHit = function(actor) {
    // Collision masks are relative to 0,0.
    var actorCollisionMasks = actor.getCollisionMask(this._shot);
    var shotCollisionMasks = this._shot.getCollisionMask(actor);

    var actorCoordinates = actor.getCoordinates();
    var shotCoordinates = this._shot.getCoordinates();

    // Offset collision masks to the current positions before testing for collision.
    var actorCollisionAreas = [];
    for (var i=0; i < actorCollisionMasks.length; i++) {
        var actorCollisionArea = {
            left: actorCollisionMasks[i].left + actorCoordinates.x,
            right: actorCollisionMasks[i].right + actorCoordinates.x,
            top: actorCollisionMasks[i].top + actorCoordinates.y,
            bottom: actorCollisionMasks[i].bottom + actorCoordinates.y
        };
        actorCollisionAreas.push(actorCollisionArea);
    }

    var shotCollisionAreas = [];
    for (i=0; i < shotCollisionMasks.length; i++) {
        var shotCollisionArea = {
            left: shotCollisionMasks[i].left + shotCoordinates.x,
            right: shotCollisionMasks[i].right + shotCoordinates.x,
            top: shotCollisionMasks[i].top + shotCoordinates.y,
            bottom: shotCollisionMasks[i].bottom + shotCoordinates.y
        };
        shotCollisionAreas.push(shotCollisionArea);
    }

    if (this.areasCollide(actorCollisionAreas, shotCollisionAreas)) {
        var damage = this._shot.getDamageAgainst(actor);
        var hitEffective = actor.hitBy(this._shot, damage);

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
};

HitArbiter.prototype.areasCollide = function(areas1, areas2) {
    var self = this;

    for (var area1Index = 0; area1Index < areas1.length; area1Index++) {
        for (var area2Index = 0; area2Index < areas2.length; area2Index++) {
            if (self.singleAreasCollide(areas1[area1Index], areas2[area2Index])) {
                return true;
            }
        }
    }

    return false;
};

HitArbiter.prototype.singleAreasCollide = function(area1, area2) {
    var collision = (
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
};

module.exports = HitArbiter;