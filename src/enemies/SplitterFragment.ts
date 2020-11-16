import Debug from "debug";
const debug = Debug("Blaster:SplitterFragment");
import {random} from 'underscore';

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from '../Bounds';
import {Clock} from "../timing/Clock";
import {Enemy} from './Enemy';
import {ExplosionProperties} from '../ExplosionProperties';
import {HitArbiter} from '../HitArbiter';
import {ImageDetails} from '../ImageDetails';
import {PathAction} from '../paths/PathAction';
import {PathEntry} from "../paths/PathEntry";
import {PathTemplate} from '../paths/PathTemplate';
import {Point} from '../Point';
import {ScheduledAction} from '../paths/ScheduledAction';
import {Scheduler} from '../timing/Scheduler';
import {Shrapnel} from '../shots/Shrapnel';
import {SplinePath} from '../paths/SplinePath';
import {World} from "../World";

export class SplitterFragment extends Enemy {
    public static readonly InitialHealth: number = 1;

    private static _pathsCalculated: boolean = false;
    private static _floatAroundPath1Template: PathEntry[];
    private static _floatAroundPath2Template: PathEntry[];
    private static _flyRightPathTemplate: PathEntry[];
    private static _flyLeftPathTemplate: PathEntry[];
    private static _diveRightPathTemplate: PathEntry[];
    private static _diveLeftPathTemplate: PathEntry[];
    private static _flyUpPathTemplate: PathEntry[];
    private static _flyDownPathTemplate: PathEntry[];
    private static _separatePath: PathEntry[][];

    private readonly _side: SplitterFragment.Side;
    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private readonly _frameIndices: number[] = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
    private _currentFrame: number = 0;
    private _currentPath!: PathEntry[];
    private _currentPathTemplate!: PathEntry[];
    private _pathPosition!: number;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock, side: SplitterFragment.Side, startingPoint: Point) {
        super(audioPlayer, world, startingPoint, SplitterFragment.InitialHealth);
        debug('SplitterFragment constructor');

        this._side = side;
        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);

        this.calculatePaths();
        this.prepareNextPath(SplitterFragment._separatePath[side]);
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
        return [new Bounds(-25, 25, -15, 15)];
    }

    getDamageAgainst(actor: Actor) {
        return 5;
    }

    get imageDetails(): ImageDetails {
        if ((this._currentPathTemplate === SplitterFragment._separatePath[SplitterFragment.Side.Left]) ||
            (this._currentPathTemplate === SplitterFragment._separatePath[SplitterFragment.Side.Right])) {
            const currentFrame = Math.round(this._pathPosition / this._currentPath.length * 9);
            const imageName = (this._side === SplitterFragment.Side.Left) ? 'splitter_left_separation' : 'splitter_right_separation';

            return new ImageDetails(imageName, 10, 60, currentFrame);
        }
        else {
            return new ImageDetails('splitter_fragment', 6, 60, this._frameIndices[this._currentFrame]);
        }
    }

    hitBy(actor: Actor, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('SplitterFragment.tick');
        super.tick();

        this._scheduler.executeDueOperations();

        this.step();

        // Check if this Splitter fragment has collided with any active enemies.
        const player = this._world.player;
        if (player) {
            this._hitArbiter.attemptToHit(player);
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

    private scheduleNextBombDrop() {
        // Need to bind so that 'this' in dropBomb will refer to the Splitter fragment.
        this._scheduler.scheduleOperation(
            'dropBombAt',
            3000,
            () => { this.dropBomb() }
        );
    }

    private dropBomb(): void {
        const shrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 270);
        this._world.addActor(shrapnel);
    }

    private step(): void {
        // Choose the next path to follow once we've reach the end of the current path.
        if (this._pathPosition >= this._currentPath.length) {
            let nextPath;
            if ((this._currentPathTemplate === SplitterFragment._floatAroundPath1Template)
                || (this._currentPathTemplate === SplitterFragment._floatAroundPath2Template)) {
                if (random(0, 1) > 0.5) {
                    if (this._location.x < this._world.dimensions.width / 2) {
                        nextPath = SplitterFragment._flyRightPathTemplate;
                    }
                    else {
                        nextPath = SplitterFragment._flyLeftPathTemplate;
                    }
                }
                else {
                    if (this._location.y < this._world.dimensions.height / 2) {
                        if (random(0, 1) > 0.5) {
                            nextPath = SplitterFragment._flyDownPathTemplate;
                        }
                        else {
                            if (this._location.x < this._world.dimensions.width / 2) {
                                nextPath = SplitterFragment._diveRightPathTemplate;
                            }
                            else {
                                nextPath = SplitterFragment._diveLeftPathTemplate;
                            }
                        }
                    }
                    else {
                        nextPath = SplitterFragment._flyUpPathTemplate;
                    }
                }
            }
            else {
                if (random(0, 1) > 0.5) {
                    nextPath = SplitterFragment._floatAroundPath1Template;
                }
                else {
                    nextPath = SplitterFragment._floatAroundPath2Template;
                }
            }

            this.prepareNextPath(nextPath);
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

    private calculatePaths(): void {
        if (!SplitterFragment._pathsCalculated) {
            const floatAroundPath1 = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(20.0, 30.0),
                    new Point(0.0, 50.0),
                    new Point(-30.0, 20.0),
                    new Point(0.0, 0.0)
                ],
                []
            ));
            SplitterFragment._floatAroundPath1Template = floatAroundPath1.getPath(25);

            const floatAroundPath2 = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(-25.0, 35.0),
                    new Point(0.0, 40.0),
                    new Point(35.0, 25.0),
                    new Point(0.0, 0.0)
                ],
                []
            ));
            SplitterFragment._floatAroundPath2Template = floatAroundPath2.getPath(25);

            const flyRightPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(20.0, -20.0),
                    new Point(60.0, 10.0),
                    new Point(100.0, 30.0),
                    new Point(140.0, 0.0)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ));
            SplitterFragment._flyRightPathTemplate = flyRightPath.getPath(30);

            const flyLeftPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-20, -20),
                    new Point(-60, -40),
                    new Point(-100, 25),
                    new Point(-140, 0)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ))
            SplitterFragment._flyLeftPathTemplate = flyLeftPath.getPath(30);

            const flyUpPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-15, -10),
                    new Point(-35, -25),
                    new Point(20, -40),
                    new Point(40, -60),
                    new Point(10, -80),
                    new Point(0, -100)
                ],
                [
                    new ScheduledAction(0.00, PathAction.Fire),
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ));
            SplitterFragment._flyUpPathTemplate = flyUpPath.getPath(30);

            const flyDownPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(15, 10),
                    new Point(-20, 25),
                    new Point(-60, 40),
                    new Point(-10, 60),
                    new Point(30, 80),
                    new Point(0, 100)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire),
                    new ScheduledAction(1.00, PathAction.Fire)
                ]
            ));
            SplitterFragment._flyDownPathTemplate = flyDownPath.getPath(30);

            const diveRightPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-40, 50),
                    new Point(-80, 120),
                    new Point(0, 240),
                    new Point(100, 240),
                    new Point(150, 120),
                    new Point(200, 20)
                ],
                [
                    new ScheduledAction(0.20, PathAction.Fire),
                    new ScheduledAction(0.40, PathAction.Fire),
                    new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
                ]
            ));
            SplitterFragment._diveRightPathTemplate = diveRightPath.getPath(60);

            const diveLeftPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(40, 30),
                    new Point(60, 100),
                    new Point(-20, 240),
                    new Point(-120, 240),
                    new Point(-180, 120),
                    new Point(-200, 20)
                ],
                [
                    new ScheduledAction(0.20, PathAction.Fire),
                    new ScheduledAction(0.40, PathAction.Fire),
                    new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
                ]
            ));
            SplitterFragment._diveLeftPathTemplate = diveLeftPath.getPath(60);

            const separateLeftPath = new SplinePath(new PathTemplate(
                [
                    new Point(0,0),
                    new Point(-60, -0),
                    new Point(-60, -60)
                ],
                []
            )).getPath(20);
            const separateRightPath = SplinePath.mirrorPath(separateLeftPath);
            SplitterFragment._separatePath = [];
            SplitterFragment._separatePath[SplitterFragment.Side.Left] = separateLeftPath;
            SplitterFragment._separatePath[SplitterFragment.Side.Right] = separateRightPath;

            SplitterFragment._pathsCalculated = true;
        }
    }

    private prepareNextPath(pathTemplate: PathEntry[]) {
        this._currentPathTemplate = pathTemplate;
        this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
        this._pathPosition = 0;
    }
}

export namespace SplitterFragment {
    export enum Side {
        Left,
        Right
    }
}

