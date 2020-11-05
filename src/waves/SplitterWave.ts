import Debug from "debug";
const debug = Debug("Blaster:SplitterWave");
import {random} from 'underscore';

import {Point} from '../Point';
import {Splitter} from '../enemies/Splitter';
import {World} from "../World";
import {Clock} from "../timing/Clock";

export class SplitterWave implements Wave {
    private readonly _audioPlayer: any;
    private readonly _world: World;
    private readonly _clock: Clock;
    private _addNextEnemyAt: Date = new Date();
    private _numberOfEnemiesLeftToDeploy: number = 15;

    constructor(audioPlayer: any, world: World, clock: Clock) {
        debug('SplitterWave constructor');
        this._audioPlayer = audioPlayer;
        this._world = world;
        this._clock = clock;
    }

    isActive(): boolean {
        return (this._numberOfEnemiesLeftToDeploy > 0)
            || (this._world.getActiveEnemies().length > 0)
            || (this._world.getActiveExplosions().length > 0);
    }

    tick(): void {
        debug('SplitterWave.tick');

        if (this._numberOfEnemiesLeftToDeploy > 0) {
            // Add new enemy when the time comes, but only if a maximum allowed aren't already active.
            if ((this._addNextEnemyAt <= new Date()) && (this._world.getActiveEnemies().length < 3)) {
                // Space out the addition of enemies.
                this._addNextEnemyAt = new Date();
                this._addNextEnemyAt.setSeconds(this._addNextEnemyAt.getSeconds() + 1);

                let worldDimensions = this._world.getDimensions();
                let splitterStartingPoint = new Point(
                    Math.floor(random(100 + 50, worldDimensions.width - 100 - 50)),
                    -20
                );
                let _splitter = new Splitter(this._audioPlayer, this._world, this._clock, splitterStartingPoint);
                this._world.addActor(_splitter);

                this._numberOfEnemiesLeftToDeploy--;
            }
        }
    }
}
