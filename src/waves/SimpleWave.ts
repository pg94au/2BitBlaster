import Debug from "debug";
const debug = Debug("Blaster:SimpleWave");
import {random} from 'underscore';

import {Point} from '../Point';
import {Saucer} from '../enemies/Saucer';
import {World} from "../World";
import {Clock} from "../timing/Clock";

export class SimpleWave implements Wave {
    private readonly _audioPlayer: any;
    private readonly _world: World;
    private readonly _clock: Clock;
    private _addNextEnemyAt: Date = new Date();
    private _numberOfEnemiesLeftToDeploy: number = 20;

    constructor(audioPlayer: any, world: World, clock: Clock) {
        debug('SimpleWave constructor');
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
        debug('SimpleWave.tick');

        //TODO: This is just a simple demonstration of how a wave can manage adding enemies to the world.
        if (this._numberOfEnemiesLeftToDeploy > 0) {
            // Add new enemy when the time comes, but only if a maximum allowed aren't already active.
            if ((this._addNextEnemyAt <= new Date()) && (this._world.getActiveEnemies().length < 5)) {
                // Space out the addition of enemies.
                this._addNextEnemyAt = new Date();
                this._addNextEnemyAt.setSeconds(this._addNextEnemyAt.getSeconds() + 1);

                let worldDimensions = this._world.getDimensions();
                let saucerStartingPoint = new Point(
                    Math.floor(random(100 + 50, worldDimensions.width - 100 - 50)),
                    -20
                );
                let _saucer = new Saucer(this._audioPlayer, this._world, this._clock, saucerStartingPoint);
                this._world.addActor(_saucer);

                this._numberOfEnemiesLeftToDeploy--;
            }
        }
    }
}