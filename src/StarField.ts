import Debug from "debug";
import {random} from 'underscore';

const debug = Debug("Blaster:StarField");

import {Clock} from "./timing/Clock";
import {Point} from './Point';
import {Scheduler} from './timing/Scheduler';
import {Star} from './Star';
import {World} from "./World";

export class StarField {
    private readonly _world: World;
    private readonly _scheduler: Scheduler;
    private _firstTick: boolean = true;

    constructor(world: World, clock: Clock) {
        debug('StarField constructor');
        this._world = world;
        this._scheduler = new Scheduler(clock);
    }

    tick(): void {
        if (this._firstTick) {
            this.initializeStarField();
            this._firstTick = false;
            this._scheduler.scheduleOperation('addStar', random(500, 1000), () => this.addStar());
        }

        // Continually add new stars to the world.
        this._scheduler.executeDueOperations();
    }

    private initializeStarField(): void {
        // Fill the screen with stars before it starts scrolling.
        const worldDimensions = this._world.getDimensions();
        for (let y = 0; y < worldDimensions.height; y++) {
            if (random(1, 100) > 95) {
                const x = random(10, worldDimensions.width - 10);
                const star = new Star(this._world, new Point(x, y));
                this._world.addActor(star);
            }
        }
    }

    private addStar(): void {
        const x = random(10, this._world.getDimensions().width - 10);
        const star = new Star(this._world, new Point(x, 0));
        this._world.addActor(star);

        this._scheduler.scheduleOperation('addStar', random(500, 1000), () => this.addStar());
    };
}
