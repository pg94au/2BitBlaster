import Debug from "debug";
import {EventEmitter} from "events";

const debug = Debug("Blaster:Player");

import {Actor} from './Actor';
import {Bounds} from './Bounds';
import {Bullet} from './shots/Bullet';
import {Explosion} from './Explosion';
import {ExplosionProperties} from './ExplosionProperties';
import {HitArbiter} from './HitArbiter';
import {ImageDetails} from './ImageDetails';
import {Point} from './Point';
import {Scheduler} from './timing/Scheduler';
import {Clock} from "./timing/Clock";
import {World} from "./World";
import {Shot} from "./shots/Shot";

export class Player extends Actor {
    private readonly _joystick: any;
    private readonly _audioPlayer: any;
    private readonly _bounds: Bounds;
    private readonly _hitArbiter: HitArbiter;
    private readonly _scheduler: Scheduler;
    private readonly _eventEmitter = new EventEmitter();
    private _currentHealth: number = 5;
    private _canFireBullet: boolean = true;
    private _displayingInjury: boolean = false;
    private _vulnerable: boolean = false;
    private _invulnerableFrames: number[] = [1, 2, 3, 3, 2, 1];
    private _currentInvulnerableFrameIndex: number = 2;

    constructor(joystick: any, audioPlayer: any, world: World, startingPoint: Point, bounds: Bounds, clock: Clock) {
        super(world, startingPoint);

        this._joystick = joystick;
        this._audioPlayer = audioPlayer;
        this._bounds = bounds;

        this._hitArbiter = new HitArbiter(this);
        this._scheduler = new Scheduler(clock);
        this._scheduler.scheduleOperation('becomeVulnerable', 3000, () => {
            debug('Player becoming vulnerable');
            this._vulnerable = true;
        });
    }

    getCollisionMask(): Bounds[] {
        if (this._vulnerable) {
            return [new Bounds(-20, 20, -20, 20)];
        }
        else {
            return [new Bounds(-25, 25, -35, 35)];
        }
    }

    getDamageAgainst(actor: Actor): number {
        return 5;
    }

    getImageDetails(): ImageDetails {
        if (this._vulnerable) {
            return new ImageDetails(
                'player',
                4,
                50,
                this._displayingInjury ? 1 : 0
            );
        }
        else {
            if (this._currentInvulnerableFrameIndex < this._invulnerableFrames.length - 1) {
                this._currentInvulnerableFrameIndex++;
            }
            else {
                this._currentInvulnerableFrameIndex = 2;
            }
            let currentFrame = this._invulnerableFrames[this._currentInvulnerableFrameIndex];

            return new ImageDetails(
                'player',
                4,
                50,
                currentFrame
            );
        }
    }

    getZIndex(): number {
        return 10;
    }

    hitBy(shot: Shot, damage: number): boolean {
        if (this._vulnerable) {
            this._currentHealth = Math.max(0, this._currentHealth - damage);
            this._eventEmitter.emit('health', this._currentHealth);
            this._displayingInjury = true;
            this._scheduler.scheduleOperation('displayInjury', 150, () => {
                this._displayingInjury = false;
            });
            this._audioPlayer.play('player_hit');
            return true;
        }
        else {
            return false;
        }
    }

    on(event: string, args: (...args: any[]) => void): void {
        debug('Player.on');
        this._eventEmitter.on(event, args);
        this._eventEmitter.emit('health', this._currentHealth);
    }

    tick(): void {
        debug('Player.tick');

        this._scheduler.executeDueOperations();

        if (this._currentHealth <= 0) {
            this._active = false;

            let explosionProperties = new ExplosionProperties(
                'player_explosion',
                4,
                80,
                0.8,
                'player_explosion'
            );
            let playerExplosion = new Explosion(
                explosionProperties,
                this._audioPlayer,
                this._world,
                this._location
            );
            this._world.addActor(playerExplosion);

            return;
        }

        let direction = this._joystick.getCurrentDirection();

        for (let i = 0; i < 5; i++) {
            super.move(direction);
        }

        if (this._location.x < this._bounds.left) {
            this._location = this._location.withX(this._bounds.left);
        }
        if (this._location.x > this._bounds.right) {
            this._location = this._location.withX(this._bounds.right);
        }
        if (this._location.y < this._bounds.top) {
            this._location = this._location.withY(this._bounds.top);
        }
        if (this._location.y > this._bounds.bottom) {
            this._location = this._location.withY(this._bounds.bottom);
        }

        debug('Current position is (' + this._location + ')');

        // Check if the player has collided with any active enemies.
        this._world.getActiveEnemies().forEach((enemy: any) => {
            this._hitArbiter.attemptToHit(enemy);
        });

        // Add a new bullet to the world if joystick is fired and allowed.
        if (this._joystick.getFireState()) {
            if (this._canFireBullet) {
                this._canFireBullet = false;
                let bullet = new Bullet(this._audioPlayer, this._world, this._location);
                this._world.addActor(bullet);

                // Another bullet cannot be fired until a fixed time period.
                this._scheduler.scheduleOperation('canFireBullet', 1000, () => {
                    debug('tick: Next bullet can now be fired.');
                    this._canFireBullet = true;
                });
            }
        }
    }
}
