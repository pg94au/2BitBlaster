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
import { LineSegmentPath } from "../paths/LineSegmentPath";

export class Zagger extends Enemy {
    public static readonly InitialHealth: number = 1;

    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private readonly _homePosition: Point;
    private _currentFrame: number = 0;
    private _currentPath!: PathEntry[];
    private _currentPathTemplate!: PathEntry[];
    private _pathPosition!: number;
    private _state: Zagger.State;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock, startingPoint: Point, homePosition: Point) {
        super(audioPlayer, world, startingPoint, Zagger.InitialHealth);
        debug('Zagger constructor');

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);
        this._homePosition = homePosition;

        this.prepareEntryPath(homePosition);
        this._state = Zagger.State.Entering;
        this.advanceCurrentFrame();
    }

    get state(): Zagger.State {
        return this._state;
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
        return [new Bounds(-40, 40, -25, 25)];
    }

    getDamageAgainst(target: Actor): number {
        return 5;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('spider', 3, 95, this._currentFrame);
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
        this._currentFrame = (this._currentFrame + 1) % 3;

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

    public swoop(): void {
        if (random(0, 1) === 0) {
            // Swoop down and off the screen.
            const lowestPoint = new Point(Math.floor(random(10, 430)), 670);
            const turns = random(0, 2);
            switch (turns) {
                case 0:
                    const linePath = new LinePath(this._location, lowestPoint, []);
                    this._currentPath = linePath.getPathForSpeed(5);
                    this._pathPosition = 0;
                    this._state = Zagger.State.Swooping;
                    break;
                case 1:
                    const midPoint = new Point(Math.floor(random(10, 430)), random(300, 500));
                    this._currentPath = new LineSegmentPath([this._location, midPoint, lowestPoint], []).getPathForSpeed(5);
                    this._pathPosition = 0;
                    this._state = Zagger.State.Swooping;
                    break;
                case 2:
                    const midPoint1 = new Point(Math.floor(random(10, 430)), random(300, 400));
                    const midPoint2 = new Point(Math.floor(random(10, 430)), random(400, 500));
                    this._currentPath = new LineSegmentPath([this._location, midPoint1, midPoint2, lowestPoint], []).getPathForSpeed(5);
                    this._pathPosition = 0;
                    this._state = Zagger.State.Swooping;
                    break;
              }
        }
        else {
            // Swwop and return to home.
            const lowestPoint = new Point(Math.floor(random(10, 430)), 580);
            const swoopDownPath = new LinePath(this._location, lowestPoint, []);
            const swoopReturnPath = new LinePath(lowestPoint, this._homePosition, []);
            this._currentPath = swoopDownPath.getPathForSpeed(5).concat(swoopReturnPath.getPathForSpeed(5));
            this._pathPosition = 0;
            this._state = Zagger.State.SwoopAndReturn;
        }
    }

    private step(): void {
        // Choose the next path to follow once we've reach the end of the current path.
        if (this._pathPosition >= this._currentPath.length) {

            switch (this._state) {
                case Zagger.State.Entering:
                    this._state = Zagger.State.Waiting;
                    break;
                case Zagger.State.SwoopAndReturn:
                    this._state = Zagger.State.Waiting;
                    break;
                case Zagger.State.Swooping:
                    this._scheduler.scheduleOperation(
                        'enter',
                        3000,
                        () => {
                            // Determine our path back to our home position after.
                            const worldDimensions = this._world.dimensions;
                            const zaggerStartingPoint = new Point(
                                Math.floor(random(0, worldDimensions.width-50)),
                                -20
                            );
                            const linePath = new LinePath(zaggerStartingPoint, this._homePosition, []);
                            this._currentPath = linePath.getPathForSteps(20);
                            this._pathPosition = 0;
                            this._state = Zagger.State.Entering;
                        }
                    );
                    this._state = Zagger.State.Waiting;
                    break;
            }

            // Possibly at some random chance drop bombs?

            return;
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
        this._currentPath = linePath.getPathForSteps(10);
        this._pathPosition = 0;
    }
}

export module Zagger {
    export enum State {
        Entering,
        SwoopAndReturn,
        Swooping,
        Waiting
    }
}
