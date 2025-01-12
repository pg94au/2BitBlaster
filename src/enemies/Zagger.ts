import Debug from "debug";
const debug = Debug("Blaster:Saucer");
import {random} from 'underscore';

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bomb} from '../shots/Bomb';
import {Bounds} from '../Bounds';
import {Clock} from "../timing/Clock";
import {Enemy} from './Enemy';
import {ExplosionProperties} from '../ExplosionProperties';
import {HitArbiter} from '../HitArbiter';
import {ImageDetails} from '../ImageDetails';
import {LinePath} from '../paths/LinePath';
import {PathAction} from '../paths/PathAction';
import {PathEntry} from "../paths/PathEntry";
import {Point} from '../Point';
import {ScheduledAction} from '../paths/ScheduledAction';
import {Scheduler} from '../timing/Scheduler';
import {SplinePath} from '../paths/SplinePath';
import {World} from "../World";

export class Zagger extends Enemy {
    public static readonly InitialHealth: number = 1;

    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private _currentFrame: number = 0;
    private _currentPath!: PathEntry[];
    private _currentPathTemplate!: PathEntry[];
    private _pathPosition!: number;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock, startingPoint: Point, homePosition: Point) {
        super(audioPlayer, world, startingPoint, Zagger.InitialHealth);
        debug('Zagger constructor');

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);

        this.prepareEntryPath(homePosition);
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
    }

    get scoreTotal(): number {
        return 10;
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return [new Bounds(-20, 20, -20, 20)];
    }

    getDamageAgainst(target: Actor): number {
        return 5;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('saucer', 4, 80, this._currentFrame);
    }

    hitBy(actor: Actor, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('Zagger.tick');
        super.tick();

        if (!this._isActive) {
            return;
        }

        this._scheduler.executeDueOperations();

        this.step();

        // Check if this saucer has collided with any active enemies.
        const player = this._world.player;
        if (player) {
            this._hitArbiter.attemptToHit(player);
        }
    }

    private advanceCurrentFrame(): void {
        this._currentFrame = (this._currentFrame + 1) % 4;

        this._scheduler.scheduleOperation(
            'advanceCurrentFrame',
            200,
            () => { this.advanceCurrentFrame() }
        );
    }

    private dropBomb(): void {
        const bomb = new Bomb(this._audioPlayer, this._world, this._location);
        this._world.addActor(bomb);
    }

    private step(): void {
        // Choose the next path to follow once we've reach the end of the current path.
        if (this._pathPosition >= this._currentPath.length) {
            return;
            //let nextPath: PathEntry[];

            // What do we do once we reach home...
            // if (this._currentPathTemplate === Zagger._floatAroundPathTemplate) {
            //     if (random(0, 1) > 0.5) {
            //         if (this._location.x < this._world.dimensions.width / 2) {
            //             nextPath = Zagger._flyRightPathTemplate;
            //         }
            //         else {
            //             nextPath = Zagger._flyLeftPathTemplate;
            //         }
            //     }
            //     else {
            //         if (this._location.y < this._world.dimensions.height / 2) {
            //             if (random(0, 1) > 0.5) {
            //                 nextPath = Zagger._flyDownPathTemplate;
            //             }
            //             else {
            //                 if (this._location.x < this._world.dimensions.width / 2) {
            //                     nextPath = Zagger._diveRightPathTemplate;
            //                 }
            //                 else {
            //                     nextPath = Zagger._diveLeftPathTemplate;
            //                 }
            //             }
            //         }
            //         else {
            //             nextPath = Zagger._flyUpPathTemplate;
            //         }
            //     }
            // }
            // else {
            //     nextPath = Zagger._floatAroundPathTemplate;
            // }

            //     this.prepareNextPath(nextPath);
        }

        // Follow the current path.
        switch(this._currentPath[this._pathPosition].action) {
            case PathAction.Move:
                this._location = this._currentPath[this._pathPosition].location!;
                break;
            case PathAction.Fire:
                this.dropBomb();
                break;
        }
        this._pathPosition++;
    }

    private prepareEntryPath(homePosition: Point): void {
        const linePath = new LinePath(this._location, homePosition, []);
        this._currentPath = linePath.getPath(20);
        this._pathPosition = 0;
    }

    private prepareNextPath(pathTemplate: PathEntry[]): void {
        this._currentPathTemplate = pathTemplate;
        this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
        this._pathPosition = 0;
    }
}
