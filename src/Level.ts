import Debug from "debug";
const debug = Debug("Blaster:Level");

import {Wave} from "./waves/Wave";

export class Level {
    private _active: boolean = true;
    private _currentWave: number = 0;
    private _waves: Wave[];

    constructor(waves: Wave[]) {
        debug('Level constructor');
        if (waves === undefined) {
            throw new Error('waves cannot be undefined');
        }
        this._waves = waves;
    }

    get active(): boolean {
        return this._active;
    }

    tick(): void {
        debug('Level.tick');

        if (this._currentWave < this._waves.length) {
            this._waves[this._currentWave].tick();

            if (!this._waves[this._currentWave].isActive()) {
                this._currentWave++;
            }
        }
        else {
            this._active = false;
        }
    }
}
