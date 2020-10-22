import {describe} from 'mocha';
import {expect} from 'chai';

import {HitArbiter} from "../src/HitArbiter";
import {HitResult} from "../src/HitResult";

let ActorStubBuilder = require('./builders/ActorStubBuilder');


let testData = [
    {
        // Two areas are completely disjoint.
        area1: [{ left: 1, right: 2, top: 1, bottom: 2 }],
        area2: [{ left: 10, right: 20, top: 10, bottom: 20 }],
        result: false
    },
    {
        // First area contained entirely within second.
        area1: [{left: 2, right: 3, top: 12, bottom: 13}],
        area2: [{left: 1, right: 4, top: 11, bottom: 14}],
        result: true
    },
    {
        // Second area contained entirely within first.
        area1: [{left: 1, right: 4, top: 11, bottom: 14}],
        area2: [{left: 2, right: 3, top: 12, bottom: 13}],
        result: true
    },
    {
        // First and second areas are identical.
        area1: [{left: 1, right: 2, top: 3, bottom: 4}],
        area2: [{left: 1, right: 2, top: 3, bottom: 4}],
        result: true
    },
    {
        // First and second areas overlap to the left.
        area1: [{left: 5, right: 10, top: 100, bottom: 110}],
        area2: [{left: 1, right: 5, top: 100, bottom: 110}],
        result: true
    },
    {
        // First and second areas overlap to the right.
        area1: [{left: 5, right: 10, top: 100, bottom: 110}],
        area2: [{left: 10, right: 15, top: 100, bottom: 110}],
        result: true
    },
    {
        // First and second areas overlap to the top.
        area1: [{left: 5, right: 10, top: 100, bottom: 110}],
        area2: [{left: 5, right: 10, top: 90, bottom: 100}],
        result: true
    },
    {
        // First and second areas overlap to the bottom.
        area1: [{left: 5, right: 10, top: 100, bottom: 110}],
        area2: [{left: 5, right: 10, top: 110, bottom: 120}],
        result: true
    },
    {
        // Second area of first mask collides with second mask.
        area1: [{left: 10, right: 11, top: 10, bottom :11}, {left: 1, right: 2, top: 3, bottom: 4}],
        area2: [{left: 1, right: 2, top: 3, bottom: 4}],
        result: true
    },
    {
        // Second area of second mask collides with first mask.
        area1: [{left: 1, right: 2, top: 3, bottom: 4}],
        area2: [{left: 10, right: 11, top: 10, bottom: 11}, {left: 1, right: 2, top: 3, bottom: 4}],
        result: true
    },
    {
        // Multiple masks for each area, but no collision.
        area1: [{left: 1, right: 2, top: 3, bottom: 4}, {left: 5, right: 6, top: 7, bottom: 8}],
        area2: [{left: 9, right: 10, top: 11, bottom: 12}, {left: 13, right: 14, top: 15, bottom: 16}],
        result: false
    }
];


describe('HitArbiter', () => {
    describe('#areasCollide()', () => {
        testData.forEach(function(testParameters) {
            it('should result in ' + testParameters.result +
                ', with area1=' + JSON.stringify(testParameters.area1) +
                ' and area2=' + JSON.stringify(testParameters.area2), function() {
                let hitArbiter = new HitArbiter({});
                let result = hitArbiter.areasCollide(testParameters.area1, testParameters.area2);
                expect(result).to.be.equal(testParameters.result);
            });
        });
    });

    describe('#attemptToHit()', () => {
        it('returns false if the shot misses the actor', () => {
            let shot = new ActorStubBuilder().withCoordinates(1, 1).withCollisionMask(-10, 10, -10, 10).build();
            let actor = new ActorStubBuilder().withCoordinates(1000, 1000).withCollisionMask(-10, 10, -10, 10).build();
            let hitArbiter = new HitArbiter(shot);
            let result = hitArbiter.attemptToHit(actor);
            expect(result).to.be.equal(HitResult.Miss);
        });

        it('hits actor for shot damage when shot collides with actor', () => {
            let shot = new ActorStubBuilder()
                .withCoordinates(1, 1)
                .withCollisionMask(-10, 10, -10, 10)
                .inflictsDamage(10)
                .build();
            let actor = new ActorStubBuilder().withCoordinates(1, 1).withCollisionMask(-10, 10, -10, 10).build();
            let hitArbiter = new HitArbiter(shot);
            let result = hitArbiter.attemptToHit(actor);
            expect(result).to.be.equal(HitResult.Effective);
            expect(actor.getSustainedDamage()).to.be.equal(10);
        });

        it('indicates to shot when actor declines damage', () => {
            let shot = new ActorStubBuilder()
                .withCoordinates(1, 1)
                .withCollisionMask(-10, 10, -10, 10)
                .inflictsDamage(10)
                .build();
            let actor = new ActorStubBuilder()
                .withCoordinates(1, 1)
                .withCollisionMask(-10, 10, -10, 10)
                .declinesDamage()
                .build();
            let hitArbiter = new HitArbiter(shot);
            let result = hitArbiter.attemptToHit(actor);
            expect(result).to.be.equal(HitResult.Ineffective);
        });
    });
});
