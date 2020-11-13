import Debug from "debug";
const debug = Debug("Blaster:Probe");
import {random} from 'underscore';

import {Actor} from "../Actor";
import {Bomb} from '../shots/Bomb';
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
import {SplinePath} from '../paths/SplinePath';
import {World} from "../World";

export class Probe extends Enemy {
    public static readonly InitialHealth: number = 3;

    private static _pathsCalculated: boolean = false;
    private static _introPathTemplate: PathEntry[];
    private static _diveRightPathTemplate: PathEntry[];
    private static _diveLeftPathTemplate: PathEntry[];
    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private _currentFrame: number = 0;
    private _currentPath!: PathEntry[];
    private _currentPathTemplate!: PathEntry[];
    private _pathPosition!: number;

    constructor(audioPlayer: any, world: World, clock: Clock, startingPoint: Point) {
        super(audioPlayer, world, startingPoint, Probe.InitialHealth);
        debug('Probe constructor');

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);

        this.calculatePaths();
        this.prepareNextPath(Probe._introPathTemplate);
        this.advanceCurrentFrame();
    }

    getExplosionProperties(): ExplosionProperties {
        return new ExplosionProperties(
            'probe_explosion',
            4,
            75,
            0.8,
            'probe_explosion'
        );
    }

    getScoreTotal(): number {
        return 25;
    }

    getCollisionMask(): Bounds[] {
        return [new Bounds(-20, 20, -20, 20)];
    }

    getDamageAgainst(actor: Actor): number {
        return 5;
    }

    getImageDetails(): ImageDetails {
        return new ImageDetails('probe', 3, 70, Math.min(3 - this._health, 2));
    }

    hitBy(actor: Actor, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('Probe.tick');
        super.tick();

        this._scheduler.executeDueOperations();

        this.move();

        // Check if this probe has collided with any active enemies.
        let player = this._world.getPlayer();
        if (player) {
            this._hitArbiter.attemptToHit(player);
        }
    }

    dropBomb(): void {
        let bomb = new Bomb(this._audioPlayer, this._world, this._location);
        this._world.addActor(bomb);
    }

    advanceCurrentFrame(): void {
        this._currentFrame = (this._currentFrame + 1) % 2;

        this._scheduler.scheduleOperation(
            'advanceCurrentFrame',
            1000,
            () => { this.advanceCurrentFrame() }
        );
    }

    move(): void {
        // Choose the next path to follow if we've reached the end of the current path.
        if (this._pathPosition >= this._currentPath.length) {
            let nextPath;
            if (this._location.x < 120) {
                nextPath = Probe._diveRightPathTemplate;
            }
            else if (this._location.x > this._world.getDimensions().width - 120) {
                nextPath = Probe._diveLeftPathTemplate;
            }
            else if (random(0, 1) > 0.5) {
                nextPath = Probe._diveRightPathTemplate;
            }
            else {
                nextPath = Probe._diveLeftPathTemplate;
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

    calculatePaths(): void {
        if (!Probe._pathsCalculated) {
            let introPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(50.0, 100.0),
                    new Point(100.0, 200.0),
                    new Point(150.0, 300.0),
                    new Point(100.0, 400.0),
                    new Point(-25.0, 450.0),
                    new Point(-125.0, 400.0),
                    new Point(-175.0, 300.0),
                    new Point(-125.0, 200.0),
                    new Point(-75.0, 100.0),
                    new Point(-25.0, 50.0),
                    new Point(0.0, 50.0)
                ],
                [
                    new ScheduledAction(0.50, PathAction.Fire)
                ]
            ));
            Probe._introPathTemplate = introPath.getPath(100);

            let diveRightPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(-40.0, 50.0),
                    new Point(-10.0, 200.0),
                    new Point(30.0, 300.0),
                    new Point(50.0, 400.0),
                    new Point(80.0, 300.0),
                    new Point(40.0, 200.0),
                    new Point(80.0, 50.0),
                    new Point(100.0, 0.0)
                ],
                [
                    new ScheduledAction(0.01, PathAction.Fire)
                ]
            ));
            Probe._diveRightPathTemplate = diveRightPath.getPath(100);

            let diveLeftPath = new SplinePath(new PathTemplate(
                [
                    new Point(0.0, 0.0),
                    new Point(40.0, 50.0),
                    new Point(10.0, 200.0),
                    new Point(-30.0, 300.0),
                    new Point(-50.0, 400.0),
                    new Point(-80.0, 300.0),
                    new Point(-40.0, 200.0),
                    new Point(-80.0, 50.0),
                    new Point(-100.0, 0.0)
                ],
                [
                    new ScheduledAction(0.01, PathAction.Fire)
                ]
            ))
            Probe._diveLeftPathTemplate = diveLeftPath.getPath(100);
        }
    }

    prepareNextPath(pathTemplate: PathEntry[]): void {
        this._currentPathTemplate = pathTemplate;
        this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
        this._pathPosition = 0;
    }
}
