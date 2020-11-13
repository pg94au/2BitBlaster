import {describe} from 'mocha';
import {expect} from 'chai';

import {Actor} from "../src/Actor";
import {ScoreCounter} from "../src/ScoreCounter";
import {Star} from '../src/Star';
import {StarField} from '../src/StarField';
import {World} from '../src/World';

import {ClockStub} from "./stubs/ClockStub";

describe('StarField', () => {
    describe('#tick()', () => {
        it('populates the world with multiple stars on first call', () => {
            let world = new World(480, 640, new ScoreCounter());
            let clock = new ClockStub();
            let starField = new StarField(world, clock);

            starField.tick();

            expect(world.getActors().length).to.be.above(10);
        });

        it('adds stars periodically on subsequent ticks', () => {
            let world = new World(480, 640, new ScoreCounter());
            let clock = new ClockStub();
            let starField = new StarField(world, clock);

            let starAdded = false;
            starField.tick();
            clock.addSeconds(10);
            world.addActor = (actor: Actor) => { if (actor instanceof Star) { starAdded = true; }};
            starField.tick();

            expect(starAdded).to.be.true;
        });
    });
});
