import Debug from "debug";
const debug = Debug("Blaster:Saucer");
import {random} from 'underscore';

import {Bomb} from '../shots/Bomb';
import {Bounds} from '../Bounds';
import {Enemy} from './Enemy';
import {ExplosionProperties} from '../ExplosionProperties';
import {HitArbiter} from '../HitArbiter';
import {ImageDetails} from '../ImageDetails';
import {PathAction} from '../paths/PathAction';
import {PathTemplate} from '../paths/PathTemplate';
import {Point} from '../Point';
import {ScheduledAction} from '../paths/ScheduledAction';
import {Scheduler} from '../timing/Scheduler';
import {SplinePath} from '../paths/SplinePath';
import {Clock} from "../timing/Clock";
import {PathEntry} from "../paths/PathEntry";

export class Saucer extends Enemy {
    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private _health: number = 1;
    private _currentFrame: number = 0;

    private static _pathsCalculated: boolean = false;
    private static _floatAroundPathTemplate: PathEntry[];
    private static _introPathTemplate: PathEntry[];
    private static _flyRightPathTemplate: PathEntry[];
    private static _flyLeftPathTemplate: PathEntry[];
    private static _flyUpPathTemplate: PathEntry[];
    private static _flyDownPathTemplate: PathEntry[];
    private static _diveRightPathTemplate: PathEntry[];
    private static _diveLeftPathTemplate: PathEntry[];

    constructor(audioPlayer: any, world: any, clock: Clock, startingPoint: Point) {
        super(audioPlayer, world, startingPoint);
        debug('Saucer constructor');

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);

        this.calculatePaths();
        this.prepareNextPath(Saucer._introPathTemplate);
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
    }

    getScoreTotal(): number {
        return 10;
        return 10;
    }

    getCollisionMask(): Bounds[] {
        return [new Bounds(-20, 20, -20, 20)];
    }

    getDamageAgainst(): number {
        return 5;
    }

    getImageDetails(): ImageDetails {
        return new ImageDetails('saucer', 4, 80, this._currentFrame);
    }

    hitBy(actor: any, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('Saucer.tick');
        super.tick();

        this._scheduler.executeDueOperations();

        this.move();

        // Check if this saucer has collided with any active enemies.
        let player = this._world.getPlayer();
        if (player) {
            this._hitArbiter.attemptToHit(player);
        }
    }

    advanceCurrentFrame(): void {
        this._currentFrame = (this._currentFrame + 1) % 4;

        this._scheduler.scheduleOperation(
            'advanceCurrentFrame',
            200,
            () => { this.advanceCurrentFrame() }
        );
    }

    dropBomb(): void {
        let bomb = new Bomb(this._audioPlayer, this._world, this._location);
        this._world.addActor(bomb);
    }

    move(): void {
        // Choose the next path to follow once we've reach the end of the current path.
        if (this._pathPosition >= this._currentPath.length) {
            let nextPath: PathEntry[];
            if (this._currentPathTemplate === Saucer._floatAroundPathTemplate) {
                if (random(0, 1) > 0.5) {
                    if (this._location.x < this._world.getDimensions().width / 2) {
                        nextPath = Saucer._flyRightPathTemplate;
                    }
                    else {
                        nextPath = Saucer._flyLeftPathTemplate;
                    }
                }
                else {
                    if (this._location.y < this._world.getDimensions().height / 2) {
                        if (random(0, 1) > 0.5) {
                            nextPath = Saucer._flyDownPathTemplate;
                        }
                        else {
                            if (this._location.x < this._world.getDimensions().width / 2) {
                                nextPath = Saucer._diveRightPathTemplate;
                            }
                            else {
                                nextPath = Saucer._diveLeftPathTemplate;
                            }
                        }
                    }
                    else {
                        nextPath = Saucer._flyUpPathTemplate;
                    }
                }
            }
            else {
                nextPath = Saucer._floatAroundPathTemplate;
            }

            this.prepareNextPath(nextPath);
        }

        // Follow the current path.
        switch(this._currentPath[this._pathPosition].action) {
            case PathAction.Move:
                this._location = this._currentPath[this._pathPosition].location;
                break;
            case PathAction.Fire:
                this.dropBomb();
                break;
        }
        this._pathPosition++;
    }

    calculatePaths(): void {
        if (!Saucer._pathsCalculated) {
            let introPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(30.0, 100.0),
                    new Point(100.0, 150.0),
                    new Point(20.0, 200.0),
                    new Point(-20.0, 250.0),
                    new Point(-40.0, 300.0),
                    new Point(-40.0, 350.0),
                    new Point(-60.0, 400.0),
                    new Point(-30.0, 350.0),
                    new Point(-50.0, 300.0),
                    new Point(-80.0, 250.0),
                    new Point(-100.0, 200.0)
                ],
                [
                    new ScheduledAction(0.65, PathAction.Fire), // The bottom of the incoming dive.
                    new ScheduledAction(0.70, PathAction.Fire)
                ]
            ));
            Saucer._introPathTemplate = introPath.getPath(100);

            let floatAroundPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(40.0, 40.0),
                    new Point(0.0, 80.0),
                    new Point(-40.0, 40.0),
                    new Point(0.0, 0.0)
                ],
                []
            ));
            Saucer._floatAroundPathTemplate = floatAroundPath.getPath(50);

            let flyRightPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(30.0, 20.0),
                    new Point(100.0, 30.0),
                    new Point(180.0, -20.0),
                    new Point(210.0, 0.0)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ));
            Saucer._flyRightPathTemplate = flyRightPath.getPath(50);

            let flyLeftPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-30, -10),
                    new Point(-100, -45),
                    new Point(-180, 30),
                    new Point(-210, 0)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ));
            Saucer._flyLeftPathTemplate = flyLeftPath.getPath(50);

            let flyUpPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-10, -10),
                    new Point(-40, -30),
                    new Point(10, -80),
                    new Point(30, -130),
                    new Point(10, -160),
                    new Point(0, -180)
                ],
                [
                    new ScheduledAction(0.00, PathAction.Fire),
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ));
            Saucer._flyUpPathTemplate = flyUpPath.getPath(50);

            let flyDownPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(10, 10),
                    new Point(50, 30),
                    new Point(40, 80),
                    new Point(0, 130),
                    new Point(-20, 160),
                    new Point(0, 180)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire),
                    new ScheduledAction(1.00, PathAction.Fire)
                ]
            ));
            Saucer._flyDownPathTemplate = flyDownPath.getPath(50);

            let diveRightPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-40, 30),
                    new Point(30, 120),
                    new Point(120, 240),
                    new Point(160, 240),
                    new Point(180, 120),
                    new Point(200, 30)
                ],
                [
                    new ScheduledAction(0.20, PathAction.Fire),
                    new ScheduledAction(0.40, PathAction.Fire),
                    new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
                ]
            ));
            Saucer._diveRightPathTemplate = diveRightPath.getPath(60);

            let diveLeftPath = new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(40, 30),
                    new Point(-30, 120),
                    new Point(-120, 240),
                    new Point(-160, 240),
                    new Point(-180, 120),
                    new Point(-200, 30)
                ],
                [
                    new ScheduledAction(0.20, PathAction.Fire),
                    new ScheduledAction(0.40, PathAction.Fire),
                    new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
                ]
            ));
            Saucer._diveLeftPathTemplate = diveLeftPath.getPath(60);

            Saucer._pathsCalculated = true;
        }
    }

    prepareNextPath(pathTemplate: PathEntry[]): void {
        this._currentPathTemplate = pathTemplate;
        this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
        this._pathPosition = 0;
    }
}
