import Debug from "debug";
const debug = Debug("Blaster:Spinner");
import {random} from 'underscore';

import {Bomb} from '../shots/Bomb';
import {Bounds} from '../Bounds';
import {Enemy} from './Enemy';
import {ExplosionProperties} from '../ExplosionProperties';
import {HitArbiter} from '../HitArbiter';
import {ImageDetails} from '../ImageDetails';
import {PathAction} from '../paths/PathAction';
import {PathEntry} from "../paths/PathEntry";
import {PathTemplate} from '../paths/PathTemplate';
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {SplinePath} from '../paths/SplinePath';
import {Clock} from "../timing/Clock";

export class Spinner extends Enemy {
    public static readonly InitialHealth: number = 1;

    private readonly _scheduler: Scheduler;
    private readonly _hitArbiter: HitArbiter;
    private _rightPathTemplates!: PathEntry[][];
    private _leftPathTemplates!: PathEntry[][];
    private _currentFrame: number = 0;
    private _pathsCalculated: boolean = false;
    private _currentPath!: PathEntry[];
    private _currentPathTemplate!: PathEntry[];
    private _pathPosition!: number;

    constructor(audioPlayer: any, world: any, clock: Clock, startingPoint: Point, pattern: Spinner.Pattern, bias: Spinner.Bias) {
        super(audioPlayer, world, startingPoint, Spinner.InitialHealth);

        this._scheduler = new Scheduler(clock);
        this._hitArbiter = new HitArbiter(this);

        this.advanceCurrentFrame();

        this.calculatePaths();

        switch(bias) {
            case Spinner.Bias.Left:
                this.prepareNextPath(this._leftPathTemplates[pattern]);
                break;
            case Spinner.Bias.Right:
                this.prepareNextPath(this._rightPathTemplates[pattern]);
                break;
            default:
                throw new Error('Unrecognized bias argument: ' + bias);
                break;
        }
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
        return 5;
    }

    getCollisionMask(): Bounds[] {
        return [new Bounds(-30, 30, -30, 30)];
    }

    getDamageAgainst(actor: any): number {
        return 5;
    }

    getImageDetails(): ImageDetails {
        return new ImageDetails('spinner', 12, 80, this._currentFrame);
    }

    hitBy(actor: any, damage: number): boolean {
        this._health = Math.max(0, this._health - damage);
        return true;
    }

    tick(): void {
        debug('Spinner.tick');
        super.tick();

        this._scheduler.executeDueOperations();

        this.move();

        this.scheduleNextBombDrop();

        // Check if this spinner has collided with any active enemies.
        let player = this._world.getPlayer();
        if (player) {
            this._hitArbiter.attemptToHit(player);
        }
    }

    advanceCurrentFrame(): void {
        this._currentFrame = (this._currentFrame + 1) % 12;

        this._scheduler.scheduleOperation(
            'advanceCurrentFrame',
            60,
            () => { this.advanceCurrentFrame() }
        );
    }

    scheduleNextBombDrop(): void {
        // Need to bind so that 'this' in dropBomb will refer to the Spinner.
        this._scheduler.scheduleOperation(
            'dropBombAt',
            random(2000, 4000),
            () => { this.dropBomb() }
        );
    }

    dropBomb(): void {
        let worldDimensions = this._world.getDimensions();

        if (this._location.x > 0 && this._location.x < worldDimensions.width
            && this._location.y > 0 && this._location.y < worldDimensions.height) {
            // Don't drop a bomb if we're too low.  Not very fair.
            if (this._location.y < (worldDimensions.height / 2)) {
                let bomb = new Bomb(this._audioPlayer, this._world, this._location);
                this._world.addActor(bomb);
            }
        }
    }

    move(): void {
        // Choose the next path to follow once we've reach the end of the current path.
        if (this._pathPosition >= this._currentPath.length) {
            this._scheduler.scheduleOperation(
                'resetPosition',
                2000,
                () => { this._pathPosition = 0; }
            );
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

    calculatePaths(): void {
        this._rightPathTemplates = [
            new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-25, 100),
                    new Point(0, 200), // Start of first loop
                    new Point(100, 300),
                    new Point(200, 200),
                    new Point(100, 100),
                    new Point(0, 200),
                    new Point(0, 300), // Start of second loop
                    new Point(100, 400),
                    new Point(200, 300),
                    new Point(100, 200),
                    new Point(0, 300),
                    new Point(0, 400), // Drop out of sight
                    new Point(-100, 450),
                    new Point(-150, 500),
                    new Point(-225, 550),
                    new Point(-225, 700),

                    new Point(-350, 800),
                    new Point(-350, 750),
                    new Point(-350, 700),
                    new Point(-350, 500),
                    new Point(-200, 450),
                    new Point(-150, 350),
                    new Point(-150, 300),
                    new Point(-50, 200),
                    new Point(50, 300),
                    new Point(-50, 400),
                    new Point(-150, 300),
                    new Point(-250, 250),
                    new Point(-250, 150),
                    new Point(-200, 50),
                    new Point(-100, 0),
                    new Point(-100, -50),
                    new Point(-100, -100)
                ],
                []
            )).getPath(350),

            new SplinePath(new PathTemplate(
                [
                    new Point(0, 0),
                    new Point(-50, 50),
                    new Point(-100, 100),
                    new Point(-150, 150),
                    new Point(-200, 200),
                    new Point(-250, 250),
                    new Point(-300, 300),
                    new Point(-250, 350),
                    new Point(-200, 300),
                    new Point(-150, 250),
                    new Point(-100, 200),
                    new Point(-50, 150),
                    new Point(0, 100),
                    new Point(50, 150),
                    new Point(100, 250),
                    new Point(100, 300),
                    new Point(50, 400),
                    new Point(-50, 450),
                    new Point(-150, 350),
                    new Point(-250, 300),
                    new Point(-350, 200),
                    new Point(-400, 100)
                ],
                []
            )).getPath(120)
        ];

        // Build mirror image path for left swoop.
        this._leftPathTemplates = [
            SplinePath.mirrorPath(this._rightPathTemplates[0]),
            SplinePath.mirrorPath(this._rightPathTemplates[1])
        ];

        this._pathsCalculated = true;
    }

    prepareNextPath(pathTemplate: PathEntry[]) {
        this._currentPathTemplate = pathTemplate;
        this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
        this._pathPosition = 0;
    }
}

export module Spinner {
    export enum Bias {
        Left,
        Right
    }

    export enum Pattern {
        Type1 = 0,
        Type2 = 1
    }
}
