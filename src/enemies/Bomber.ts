import Debug from "debug";
const debug = Debug("Blaster:Bomber");
import {random} from 'underscore';

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from "../Bounds";
import {Clock} from "../timing/Clock";
import {Direction} from "../devices/Direction";
import {Enemy} from './Enemy';
import {ExplosionProperties} from '../ExplosionProperties';
import {Grenade} from '../shots/Grenade';
import {HitArbiter} from '../HitArbiter';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {World} from "../World";

export class Bomber extends Enemy {
    public static readonly InitialHealth: number = 1;

    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private readonly _frameIndices: number[] = [0, 1, 2, 3, 4, 5, 5, 5, 4, 3, 2, 1];
    private _currentFrame: number = 0;
    private readonly _grenadeDropPosition: number;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock, startY: number) {
        super(audioPlayer, world, new Point(-40, startY), Bomber.InitialHealth);
        debug('Bomber constructor');

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);
        this._grenadeDropPosition = random(75, this._world.getDimensions().width - 75);

        this.advanceCurrentFrame();
    }

    get explosionProperties(): ExplosionProperties {
        return new ExplosionProperties(
            'saucer_explosion',
            4,
            80,
            0.8,
            'saucer_explosion'
        );
    };

    get scoreTotal(): number {
        return 50;
    };

    getCollisionMask(actor: Actor): Bounds[] {
        return [new Bounds(-35, 45, -19, 19)];
    }

    getDamageAgainst(actor: Actor): number {
        return 5;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('bomber', 6, 80, this._frameIndices[this._currentFrame]);
    }

    hitBy(actor: Actor, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('Bomber.tick');
        super.tick();

        this._scheduler.executeDueOperations();

        for (let i = 0; i < 3; i++) {
            this.step();

            if (this._location.x === this._grenadeDropPosition) {
                this.dropGrenade();
            }
        }
    }

    private advanceCurrentFrame(): void {
        this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;

        this._scheduler.scheduleOperation(
            'advanceCurrentFrame',
            100,
            () => { this.advanceCurrentFrame() }
        );
    }

    private dropGrenade(): void {
        const grenade = new Grenade(this._audioPlayer, this._world, this._location.translate(10, 30));
        this._world.addActor(grenade);
    }

    private step(): void {
        // Move across the screen toward the right side.
        this.move(Direction.Right);

        if (this._location.x > this._world.getDimensions().width + 40) {
            this._isActive = false;
        }
    }
}
