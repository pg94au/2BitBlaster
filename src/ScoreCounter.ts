import Debug from "debug";
import {EventEmitter} from 'events';
import {post, Response} from 'superagent';

const debug = Debug("Blaster:ScoreCounter");

export class ScoreCounter {
    private _eventEmitter: EventEmitter = new EventEmitter();
    private _currentScore: number = 0;
    private _highScore: number = 0;

    constructor() {
        this.synchronizeHighScore();
    }

    synchronizeHighScore(): void {
        const highScore = {
            'highScore': this._highScore.toString()
        };

        post('highScore')
            .set('Content-Type', 'application/json')
            .send(highScore)
            .end(((postError: any, postResult: Response): void => {
            if (postError || !postResult.ok) {
                debug('Unable to post high score to server.');
                return;
            }

            this._highScore = parseInt(postResult.text);
            this._eventEmitter.emit('highScore', this._highScore);
        }));
    }

    get currentScore(): number {
        return this._currentScore;
    }

    increment(amount: number): void {
        debug('ScoreCounter.increment');

        this._currentScore += amount;
        this._eventEmitter.emit('score', this._currentScore);

        if (this._currentScore > this._highScore) {
            this._highScore = this._currentScore;
            this._eventEmitter.emit('highScore', this._highScore);
        }
    }

    on(e: string | symbol, f: (...args: any[]) => void): void {
        debug('ScoreCounter.on');
        this._eventEmitter.on(e, f);

        switch(e) {
            case 'score':
                this._eventEmitter.emit('score', this._currentScore);
                break;
            case 'highScore':
                this._eventEmitter.emit('highScore', this._highScore);
                break;
        }
    }
}
