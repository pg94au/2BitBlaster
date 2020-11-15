import {describe} from 'mocha';
import {expect} from 'chai';

import {Actor} from '../src/Actor';
import {ClockStub} from "./stubs/ClockStub";
import {Direction} from '../src/devices/Direction';
import {Point} from "../src/Point";
import {ScoreCounter} from "../src/ScoreCounter";
import {World} from "../src/World";

import {ActorStub} from "./stubs/ActorStub";
import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ShotStub} from './stubs/ShotStub';

describe('Actor', function() {
    let audioPlayer: AudioPlayerStub;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    describe('#ctor()', () => {
        it('should start active', () => {
            const actor = new ActorStub(world, new Point(1, 2));
            expect(actor.isActive()).to.be.true;
        });

        it('should start at specified coordinates', () => {
            const actor = new ActorStub(world, new Point(12, 23));
            expect(actor.getCoordinates()).to.eql(new Point(12, 23));
        });
    });

    describe('#getId()', () => {
        it('should return a new value for every instance', () => {
            const actor1 = new ActorStub(world, new Point(1, 2));
            const actor2 = new ActorStub(world, new Point(1, 2));
            expect(actor2.getId()).to.not.equal(actor1.getId());
        });
    });

    describe('#hitBy()', () => {
        it('returns false if not overridden', () => {
            const actor = new ActorStub(world, new Point(1, 2));
            const shot = new ShotStub(world, new Point(1, 2));
            expect(actor.hitBy(shot, 1)).to.be.false;
        });
    });

    describe('#move()', () => {
        it('should decrement y position when moving up', () => {
            const actor = new ActorStub(world, new Point(100, 100));
            actor.move(Direction.Up);
            expect(actor.getCoordinates().y).to.be.below(100);
        });

        it('should increment y position when moving down', () => {
            const actor = new ActorStub(world, new Point(100, 100));
            actor.move(Direction.Down);
            expect(actor.getCoordinates().y).to.be.above(100);
        });

        it('should decrement x position when moving left', () => {
            const actor = new ActorStub(world, new Point(100, 100));
            actor.move(Direction.Left);
            expect(actor.getCoordinates().x).to.be.below(100);
        });

        it('should increment x position when moving right', () => {
            const actor = new ActorStub(world, new Point(100, 100));
            actor.move(Direction.Right);
            expect(actor.getCoordinates().x).to.be.above(100);
        });
    });
});
