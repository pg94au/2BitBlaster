import {describe} from 'mocha';
import {expect} from 'chai';

import {Bounds} from '../src/Bounds';
import {HitArbiter} from "../src/HitArbiter";
import {HitResult} from "../src/HitResult";
import {ShotStub} from "./stubs/ShotStub";
import {Point} from "../src/Point";
import {ScoreCounter} from "../src/ScoreCounter";
import {WorldStub} from "./stubs/WorldStub";
import {PlayerStub} from "./stubs/PlayerStub";

const testData = [
    {
        // Two areas are completely disjoint.
        area1: [new Bounds(1, 2, 1, 2)],
        area2: [new Bounds(10, 20, 10, 20)],
        result: false
    },
    {
        // First area contained entirely within second.
        area1: [new Bounds(2, 3, 12, 13)],
        area2: [new Bounds(1, 4, 11, 14)],
        result: true
    },
    {
        // Second area contained entirely within first.
        area1: [new Bounds(1, 4, 11, 14)],
        area2: [new Bounds(2, 3, 12, 13)],
        result: true
    },
    {
        // First and second areas are identical.
        area1: [new Bounds(1, 2, 3, 4)],
        area2: [new Bounds(1, 2, 3, 4)],
        result: true
    },
    {
        // First and second areas overlap to the left.
        area1: [new Bounds(5, 10, 100, 110)],
        area2: [new Bounds(1, 5, 100, 110)],
        result: true
    },
    {
        // First and second areas overlap to the right.
        area1: [new Bounds(5, 10, 100, 110)],
        area2: [new Bounds(10, 15, 100, 110)],
        result: true
    },
    {
        // First and second areas overlap to the top.
        area1: [new Bounds(5, 10, 100, 110)],
        area2: [new Bounds(5, 10, 90, 100)],
        result: true
    },
    {
        // First and second areas overlap to the bottom.
        area1: [new Bounds(5, 10, 100, 110)],
        area2: [new Bounds(5, 10, 110, 120)],
        result: true
    },
    {
        // Second area of first mask collides with second mask.
        area1: [new Bounds(10, 11, 10, 11), new Bounds(1, 2, 3, 4)],
        area2: [new Bounds(1, 2, 3, 4)],
        result: true
    },
    {
        // Second area of second mask collides with first mask.
        area1: [new Bounds(1, 2, 3, 4)],
        area2: [new Bounds(10, 11, 10, 11), new Bounds(1, 2, 3, 4)],
        result: true
    },
    {
        // Multiple masks for each area, but no collision.
        area1: [new Bounds(1, 2, 3, 4), new Bounds(5, 6, 7, 8)],
        area2: [new Bounds(9, 10, 11, 12), new Bounds(13, 14, 15, 16)],
        result: false
    }
];


describe('HitArbiter', () => {
    let world: WorldStub;

    beforeEach(() => {
        world = new WorldStub(480, 640, new ScoreCounter());
    });

    describe('#areasCollide()', () => {
        testData.forEach((testParameters) => {
            it('should result in ' + testParameters.result +
                ', with area1=' + JSON.stringify(testParameters.area1) +
                ' and area2=' + JSON.stringify(testParameters.area2), () => {
                const shot = new ShotStub(world, new Point(1, 1));
                const hitArbiter = new HitArbiter(shot);
                const result = hitArbiter.areasCollide(testParameters.area1, testParameters.area2);
                expect(result).to.be.equal(testParameters.result);
            });
        });
    });

    describe('#attemptToHit()', () => {
        it('returns false if the shot misses the player', () => {
            const shot = new ShotStub(world, new Point(1, 1))
                .setCollisionMask([new Bounds(-10, 10, -10, 10)]);
            const player = new PlayerStub(world, new Point(100, 100));
            const hitArbiter = new HitArbiter(shot);
            const result = hitArbiter.attemptToHit(player);
            expect(result).to.be.equal(HitResult.Miss);
        });

        it('hits actor for shot damage when shot collides with actor', () => {
            const shot = new ShotStub(world, new Point(1, 1))
                .setCollisionMask([new Bounds(-10, 10, -10, 10)])
                .setDamageInflicted(10);
            let sustainedDamage: number = 0;
            const player = new PlayerStub(world, new Point(1, 1))
                .onHit(damage => { sustainedDamage += damage });
            const hitArbiter = new HitArbiter(shot);
            const result = hitArbiter.attemptToHit(player);
            expect(result).to.be.equal(HitResult.Effective);
            expect(sustainedDamage).to.be.equal(10);
        });

        it('indicates to shot when actor declines damage', () => {
            const shot = new ShotStub(world, new Point(1, 1))
                .setCollisionMask([new Bounds(-10, 10, -10, 10)])
                .setDamageInflicted(10);
            let sustainedDamage: number = 0;
            const player = new PlayerStub(world, new Point(1, 1))
                .onHit(damage => { sustainedDamage += damage })
                .ignoreHits();
            const hitArbiter = new HitArbiter(shot);
            const result = hitArbiter.attemptToHit(player);
            expect(result).to.be.equal(HitResult.Ineffective);
        });
    });
});
