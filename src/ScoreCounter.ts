import Debug from "debug";
import {EventEmitter} from 'events';
import {get, put, Response} from 'superagent';

const debug = Debug("Blaster:ScoreCounter");

export class ScoreCounter {
    private _eventEmitter: EventEmitter = new EventEmitter();
    private _currentScore: number = 0;
    private _highScore: number = 0;

    constructor() {
        this.synchronizeHighScore();
    }

    synchronizeHighScore(): void {
        let remoteHighScore: number;
        get('highScore').end(((getError: any, getResult: Response): void => {
            if (getError || !getResult.ok) {
                debug('Unable to retrieve high score from server.');
                remoteHighScore = 0;
            }
            else {
                remoteHighScore = parseInt(getResult.text);
            }

            if (this._highScore > remoteHighScore) {
                put('highScore')
                    .set('Content-Type', 'text/plain')
                    .send(this._highScore.toString())
                    .end((putError: any, putResult: Response): void => {
                        if (putError || !putResult.ok) {
                            debug('Failed to submit high score to server.');
                        }
                    });
            }
            else {
                this._highScore = remoteHighScore;
            }

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
