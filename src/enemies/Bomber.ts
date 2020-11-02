import Debug from "debug";
const debug = Debug("Blaster:Bomber");
import {random} from 'underscore';

import {Bounds} from '../Bounds';
const Enemy = require('./Enemy');
import {ExplosionProperties} from '../ExplosionProperties';
import {Grenade} from '../shots/Grenade';
import {HitArbiter} from '../HitArbiter';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {Clock} from "../timing/Clock";

export class Bomber extends Enemy {
    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private readonly _frameIndices: number[] = [0, 1, 2, 3, 4, 5, 5, 5, 4, 3, 2, 1];
    private _health: number = 1;
    private _currentFrame: number = 0;
    private readonly _grenadeDropPosition: number;

    constructor(audioPlayer: any, world: any, clock: Clock, startY: number) {
        super(audioPlayer, world, new Point(-40, startY));
        debug('Bomber constructor');

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);
        this._grenadeDropPosition = random(75, this._world.getDimensions().width - 75);

        this.advanceCurrentFrame();
    }

    getExplosionProperties(): ExplosionProperties {
        return new ExplosionProperties(
            'saucer_explosion',
            4,
            80,
            0.8,
            'saucer_explosion'
        );
    };

    getScoreTotal(): number {
        return 50;
    };

    getCollisionMask(): Bounds[] {
        return [new Bounds(-35, 45, -19, 19)];
    }

    getDamageAgainst(actor: any): number {
        return 5;
    }

    getImageDetails(): ImageDetails {
        return new ImageDetails('bomber', 6, 80, this._frameIndices[this._currentFrame]);
    }

    hitBy(actor: any, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('Bomber.tick');
        super.tick();

        this._scheduler.executeDueOperations();

        for (let i = 0; i < 3; i++) {
            this.move();

            if (this._location.x === this._grenadeDropPosition) {
                this.dropGrenade();
            }
        }
    }

    advanceCurrentFrame(): void {
        this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;

        this._scheduler.scheduleOperation(
            'advanceCurrentFrame',
            100,
            () => { this.advanceCurrentFrame() }
        );
    }

    dropGrenade(): void {
        let grenade = new Grenade(this._audioPlayer, this._world, this._location.translate(10, 30));
        this._world.addActor(grenade);
    }

    move(): void {
        // Move across the screen toward the right side.
        this._location = this._location.right();

        if (this._location.x > this._world.getDimensions().width + 40) {
            this._active = false;
        }
    }
}
