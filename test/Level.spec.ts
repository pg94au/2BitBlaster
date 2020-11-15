import {describe} from 'mocha';
import {expect} from 'chai';

import {Level} from '../src/Level';
import {WaveStub} from "./stubs/WaveStub";

describe('Level', () => {
    describe('#ctor()', () => {
        it('starts in an active state', () => {
            const level = new Level([]);
            expect(level.active).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('starts calling tick with the first wave', () => {
            let wave1Ticked = false;
            const wave1 = new WaveStub()
                .onTick(() => { wave1Ticked = true });
            const wave2 = new WaveStub();
            const level = new Level([wave1, wave2]);
            level.tick();
            expect(wave1Ticked).to.be.true;
        });

        it ('switches to ticking the next wave after each wave becomes inactive', () => {
            let wave2Ticked = false;
            const wave1 = new WaveStub()
                .setInactive();
            const wave2 = new WaveStub()
                .onTick(() => { wave2Ticked = true });
            const level = new Level([wave1, wave2]);
            level.tick();
            level.tick();
            expect(wave2Ticked).to.be.true;
        });

        it('becomes inactive when the last wave becomes inactive', () => {
            const wave1 = new WaveStub()
                .setInactive();
            const level = new Level([wave1]);
            level.tick();
            level.tick();
            expect(level.active).to.be.false;
        });
    });
});
