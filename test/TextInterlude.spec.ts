import {describe} from 'mocha';
import {expect} from 'chai';

import {Text} from '../src/Text';
import {TextInterlude} from "../src/TextInterlude";

import {ClockStub} from './stubs/ClockStub';
import WorldStubBuilder from './builders/WorldStubBuilder';

describe('TextInterlude', () => {
    describe('#ctor()', () => {
        it('starts in an active state', function () {
            let world = new WorldStubBuilder().build();
            let clock = new ClockStub();
            let textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 3, 4, 5);

            expect(textInterlude.active).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('does not immediately display text', () => {
            let textAdded = false;
            let world = new WorldStubBuilder().build();
            world.addText = (text: Text): void => { textAdded = true; };
            let clock = new ClockStub();
            let textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();

            expect(textInterlude.active).to.be.true;
            expect(textAdded).to.be.false;
        });

        it('displays text after an initial delay', () => {
            let addedText: Text | null = null;
            let world = new WorldStubBuilder().build();
            world.addText = (text: Text):void => { addedText = text; };
            let clock = new ClockStub();
            let textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.active).to.be.true;
            expect(addedText).to.be.not.undefined;
            expect(addedText!.active).to.be.true;
        });

        it('removes text after it has been displayed for a period of time', () => {
            let addedText: Text | null;
            let world = new WorldStubBuilder().build();
            world.addText = function(text) { addedText = text; };
            let clock = new ClockStub();
            let textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.active).to.be.true;
            expect(addedText!.active).to.be.false;
        });

        it('becomes inactive after a period after text is removed', () => {
            let world = new WorldStubBuilder().build();
            world.addText = (text: Text): void => {};
            let clock = new ClockStub();
            let textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
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
