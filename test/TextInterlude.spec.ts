import {describe} from 'mocha';
import {expect} from 'chai';

import {Dimensions} from "../src/Dimensions";
import {ScoreCounter} from "../src/ScoreCounter";
import {Text} from '../src/Text';
import {TextInterlude} from "../src/TextInterlude";

import {ClockStub} from './stubs/ClockStub';
import {WorldStub} from "./stubs/WorldStub";

describe('TextInterlude', () => {
    let clock: ClockStub;
    let world:  WorldStub;

    beforeEach(() => {
        clock = new ClockStub();
        world = new WorldStub(new Dimensions(480, 640), new ScoreCounter());
    });

    describe('#ctor()', () => {
        it('starts in an active state', () => {
            const textInterlude = new TextInterlude(world, clock, "TEST", "FONT", 12, "COLOR", 1, 2, 3, 4, 5);

            expect(textInterlude.active).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('does not immediately display text', () => {
            let textAdded = false;
            world.addText = (text: Text): void => { textAdded = true; };
            const textInterlude = new TextInterlude(world, clock, "TEST", "FONT", 12, "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();

            expect(textInterlude.active).to.be.true;
            expect(textAdded).to.be.false;
        });

        it('displays text after an initial delay', () => {
            let addedText: Text | null = null;
            world.addText = (text: Text):void => { addedText = text; };
            const textInterlude = new TextInterlude(world, clock, "TEST", "FONT", 12, "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.active).to.be.true;
            expect(addedText).to.be.not.undefined;
            expect(addedText!.active).to.be.true;
        });

        it('removes text after it has been displayed for a period of time', () => {
            let addedText: Text | null = null;
            world.addText = (text: Text) => { addedText = text; };
            const textInterlude = new TextInterlude(world, clock, "TEST", "FONT", 12, "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.active).to.be.true;
            expect(addedText!.active).to.be.false;
        });

        it('becomes inactive after a period after text is removed', () => {
            world.addText = (text: Text): void => {};
            const textInterlude = new TextInterlude(world, clock, "TEST", "FONT", 12, "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.active).to.be.false;
        });
    });
});
