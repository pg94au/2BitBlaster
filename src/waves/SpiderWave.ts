import Debug from "debug";
const debug = Debug("Blaster:SimpleWave");
import {random} from 'underscore';

import {AudioPlayer} from "../devices/AudioPlayer";
import {Clock} from "../timing/Clock";
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {Wave} from './Wave';
import {World} from "../World";
import {Spider} from '../enemies/Spider';

export class SpiderWave implements Wave {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _world: World;
    private readonly _clock: Clock;
    private _numberOfEnemiesLeftToDeploy: number = 15;
    private readonly _swoopers: Map<number, Spider> = new Map<number, Spider>();

    private readonly _scheduler: Scheduler;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock) {
        debug('SpiderWave constructor');
        this._audioPlayer = audioPlayer;
        this._world = world;
        this._clock = clock;

        this._scheduler = new Scheduler(clock);

        this._scheduler.scheduleOperation(
            'deploy',
            0,
            () => { this.deploySpider() }
        );
    }

    get isActive(): boolean {
        return (this._numberOfEnemiesLeftToDeploy > 0)
            || (this._world.activeEnemies.length > 0)
            || (this._world.activeExplosions.length > 0);
    }

    tick(): void {
        debug('SpiderWave.tick');

        this._scheduler.executeDueOperations();
    }

    scheduleNextSwoop(swoopIndex: number) : void {
        // If no swooper has been chosen yet, or if the last chosen swooper is dead or waiting, schedule a new swoop.
        if (!this._swoopers.has(swoopIndex) || (!this._world.activeEnemies.includes(this._swoopers.get(swoopIndex)!) || this._swoopers.get(swoopIndex)!.state === Spider.State.Waiting)) {
            if (this._world.activeEnemies.length > 0) {
                const timeTillSwoop = random(100, 1000);
                this._scheduler.scheduleOperation(
                    `next swoop ${swoopIndex}`,
                    timeTillSwoop,
                    () => {
                        const waitingSpiders = this._world.activeEnemies.filter(enemy => (enemy as Spider).state === Spider.State.Waiting);
                        if (waitingSpiders.length > 0) {
                            const spider = waitingSpiders[random(waitingSpiders.length-1)] as Spider;
                            this._swoopers.set(swoopIndex, spider);

                            spider.swoop();

                            this.scheduleNextSwoop(swoopIndex);
                        }
                        else {
                            // No waiting spiders, so try again later.
                            this._scheduler.scheduleOperation(
                                `next swoop ${swoopIndex}`,
                                500,
                                () => this.scheduleNextSwoop(swoopIndex)
                            );
                        }
                    }
                );
            }
        }

        // TODO: This could be done such that we pass a callback to the swoop method, which gets called when the swoop is complete (or die).  We wouldn't have to call this repeatedly.
        this._scheduler.scheduleOperation(`next swoop ${swoopIndex}`, 0, () => this.scheduleNextSwoop(swoopIndex));
    }

    deploySpider(): void {
        if (this._numberOfEnemiesLeftToDeploy > 0) {
            const worldDimensions = this._world.dimensions;
            const spiderStartingPoint = new Point(
                Math.floor(random(0, worldDimensions.width-50)),
                -20
            );
            const spiderHomeX = (5-(this._numberOfEnemiesLeftToDeploy-1)%5) * 80;
            const spiderHomeY = 100 + Math.floor((this._numberOfEnemiesLeftToDeploy-1)/5) * 70;
            const spiderHomePosition = new Point(spiderHomeX, spiderHomeY);
            const spider = new Spider(this._audioPlayer, this._world, this._clock, spiderStartingPoint, spiderHomePosition);
            this._world.addActor(spider);

            this._numberOfEnemiesLeftToDeploy--;

            this._scheduler.scheduleOperation(
                'deploy',
                50,
                () => { this.deploySpider() }
            );
        }
        else {
            // Get two swoopers going right away, then let them get re-scheduled as they finish.
            this._scheduler.scheduleOperation('next swoop 1', 0, () => this.scheduleNextSwoop(0));
            this._scheduler.scheduleOperation('next swoop 2', 500, () => this.scheduleNextSwoop(1));
            this._scheduler.scheduleOperation('next swoop 3', 1000, () => this.scheduleNextSwoop(2));
        }
    }
}
