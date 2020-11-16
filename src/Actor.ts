import Debug from "debug";
const debug = Debug("Blaster:Actor");
import {v4 as uuid} from 'uuid';

import {Bounds} from "./Bounds";
import {Direction} from './devices/Direction';
import {ImageDetails} from './ImageDetails';
import {Point} from './Point';
import {World} from "./World";

export abstract class Actor {
    protected readonly _id: string = uuid();
    protected readonly _world: World;
    protected _location: Point;
    protected _active: boolean = true;

    protected constructor(world: World, startCoordinates: Point) {
        debug('Actor constructor');
        this._world = world;
        this._location = startCoordinates;
    }

    get id(): string {
        return this._id;
    }

    protected move(direction: Direction) {
        if (direction & Direction.Up) {
            this._location = this._location.up();
        }
        if (direction & Direction.Down) {
            this._location = this._location.down();
        }
        if (direction & Direction.Left) {
            this._location = this._location.left();
        }
        if (direction & Direction.Right) {
            this._location = this._location.right();
        }
    }

    get coordinates(): Point {
        return this._location;
    }

    abstract get zIndex(): number;

    hitBy(actor: Actor, damage: number): boolean {
        debug('Actor.hitBy ' + actor + ' for ' + damage);
        // By default, an actor isn't affected by hits.
        return false;
    }

    abstract tick(): void;

    abstract getCollisionMask(actor: Actor): Bounds[];

    abstract getImageDetails(): ImageDetails;

    isActive(): boolean {
        debug('Actor.isActive: ' + this._active);
        return this._active;
    }
}
