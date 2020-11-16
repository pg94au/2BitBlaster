import {describe} from 'mocha';
import {expect} from 'chai';

import {Dimensions} from "../src/Dimensions";
import {Point} from '../src/Point';
import {Star} from '../src/Star';
import {ScoreCounter} from "../src/ScoreCounter";
import {World} from '../src/World';

describe('Star', () => {
    describe('#tick()', () => {
        it('moves star downwards', () => {
            const world = new World(new Dimensions(480, 640), new ScoreCounter());
            const star = new Star(world, new Point(1, 1));

            star.tick();

            expect(star.coordinates.y).to.be.above(1);
        });

        // This test is only going to be valid if all stars sparkle.
        // it('cycles image frames to sparkle the star', () => {
        //     const world = new World(new Dimensions(480, 640), new ScoreCounter());
        //     const star = new Star(world, new Point(1, 1));
        //
        //     const initialFrame = star.imageDetails.currentFrame;
        //
        //     let flickered = false;
        //     // Within this number of ticks, for sure the image should change.
        //     for (let i = 0; i < 10; i++) {
        //         star.tick();
        //         if (star.imageDetails.currentFrame != initialFrame) {
        //             flickered = true;
        //         }
        //     }
        //
        //     expect(flickered).to.be.true;
        // });

        it('sets the star inactive when it leaves the world', () => {
            const world = new World(new Dimensions(480, 640), new ScoreCounter());
            const star = new Star(world, new Point(1, world.dimensions.height));

            star.tick();

            expect(star.isActive).to.be.false;
        })
    });
});
