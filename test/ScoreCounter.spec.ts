import {describe} from 'mocha';
import {expect} from 'chai';

import {ScoreCounter} from '../src/ScoreCounter';

describe('ScoreCounter', () => {
    // Stub out high score synchronization to keep tests from making remote calls.
    ScoreCounter.prototype.synchronizeHighScore = () => {};

    describe('#ctor()', () => {
        it('starts with zero score', () => {
            const scoreCounter = new ScoreCounter();
            expect(scoreCounter.currentScore).to.be.equal(0);
        });
    });

    describe('#increment()', () => {
        it('increments the score by a specified amount', () => {
            const scoreCounter = new ScoreCounter();
            scoreCounter.increment(3);
            expect(scoreCounter.currentScore).to.be.equal(3);
        });

        it('emits a score event with the new score', () => {
            let scoreUpdate: number | null = null;
            const scoreCounter = new ScoreCounter();
            scoreCounter.on('score', (score: number): void => { scoreUpdate = score; });
            scoreCounter.increment(3);
            expect(scoreUpdate).to.be.equal(3);
        });

        it('increments high score if current score is greater than it', () => {
            const scoreCounter = new ScoreCounter();
            scoreCounter.increment(1);
            scoreCounter.reset();
            expect(scoreCounter.highScore).to.be.equal(1);
            scoreCounter.increment(2);
            expect(scoreCounter.highScore).to.be.equal(2);
        });
    });

    describe('#reset()', () => {
        it('sets the score to zero', () => {
            const scoreCounter = new ScoreCounter();
            scoreCounter.increment(1);
            scoreCounter.reset();
            expect(scoreCounter.currentScore).to.be.equal(0);
        });
    });

    describe('#on()', () => {
        it('immediately emits a score event', () => {
            let scoreUpdate: number | null = null;
            const scoreCounter = new ScoreCounter();
            scoreCounter.on('score', (score: number): void => { scoreUpdate = score; });
            expect(scoreUpdate).to.be.equal(0);
        });
    });
});
