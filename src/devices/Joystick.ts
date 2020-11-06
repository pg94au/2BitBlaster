import Debug from "debug";
const debug = Debug("Blaster:Joystick");

import {Direction} from './Direction';
import {DirectionState} from "./DirectionState";

export class Joystick {
    private _fireState: boolean = false;
    private readonly _up = new DirectionState(Direction.Up);
    private readonly _down = new DirectionState(Direction.Down);
    private readonly _left = new DirectionState(Direction.Left);
    private readonly _right = new DirectionState(Direction.Right);
    private readonly _directionStates = [this._up, this._down, this._left, this._right];

    constructor() {
        debug('Joystick constructor');
    }

    startFire(): void {
        debug('Joystick.startFire');
        this._fireState = true;
    }

    stopFire(): void {
        debug('Joystick.stopFire');
        this._fireState = false;
    }

    getFireState(): boolean {
        return this._fireState;
    }

    startUp(): void {
        debug('Joystick.startUp');
        this._up.active = true;
    }

    stopUp(): void {
        debug('Joystick.stopUp');
        this._up.active = false;
    }

    startDown(): void {
        debug('Joystick.startDown');
        this._down.active = true;
    }

    stopDown(): void {
        debug('Joystick.stopDown');
        this._down.active = false;
    }

    startLeft(): void {
        debug('Joystick.startLeft');
        this._left.active = true;
    }

    stopLeft(): void {
        debug('Joystick.stopLeft');
        this._left.active = false;
    }

    startRight(): void {
        debug('Joystick.startRight');
        this._right.active = true;
    }

    stopRight(): void {
        debug('Joystick.stopRight');
        this._right.active = false;
    }

    getCurrentDirection(): Direction {
        debug('Joystick.getCurrentDirection');

        // Start by considering only active directions.
        let activeDirections = this._directionStates.filter(directionState => { return directionState.isActive; });

        // If there are active directions, determine the resulting Direction, else the direction is None.
        if (activeDirections.length > 0) {
            // Sort these by event counter so the most recent is first.
            let sortedDirections = activeDirections.sort(
                (a, b) => { return (b.eventNumber - a.eventNumber) }
                );

            // Remove conflicting directions based on most recent event order.
            let directionsWithoutConflicts = this.removeConflictingDirectionStates(sortedDirections);

            if (directionsWithoutConflicts.length === 1) {
                // If there is only one non-conflicting direction, that is it.
                return directionsWithoutConflicts[0].direction;
            }
            else {
                // If there is more than one non-conflicting direction (there will be two),
                // then we have a diagonal direction and must calculate it.
                let first = directionsWithoutConflicts[0].direction;
                let second = directionsWithoutConflicts[1].direction;
                if (((first === Direction.Up) && (second === Direction.Left)) ||
                    ((first === Direction.Left) && (second === Direction.Up))) {
                    return Direction.Up | Direction.Left;
                }
                if (((first === Direction.Up) && (second === Direction.Right)) ||
                    ((first === Direction.Right) && (second === Direction.Up))) {
                    return Direction.Up | Direction.Right;
                }
                if (((first === Direction.Down) && (second === Direction.Left)) ||
                    ((first === Direction.Left) && (second === Direction.Down))) {
                    return Direction.Down | Direction.Left;
                }
                if (((first === Direction.Down) && (second === Direction.Right)) ||
                    ((first === Direction.Right) && (second === Direction.Down))) {
                    return Direction.Down | Direction.Right;
                }

                // To satisfy the compiler.  We should never be here.
                return Direction.None;
            }
        }
        else {
            return Direction.None;
        }
    }

    removeConflictingDirectionStates(directionStates: DirectionState[]): DirectionState[] {
        let acceptedDirections: Map<Direction, boolean> = new Map([
            [Direction.Up, false],
            [Direction.Down, false],
            [Direction.Left, false],
            [Direction.Right, false]
        ]);

        let directionStatesWithoutConflicts = directionStates.filter(
            directionState => {
                if (
                    ((directionState.direction === Direction.Up) && !acceptedDirections.get(Direction.Down)) ||
                    ((directionState.direction === Direction.Down) && !acceptedDirections.get(Direction.Up)) ||
                    ((directionState.direction === Direction.Left) && !acceptedDirections.get(Direction.Right)) ||
                    ((directionState.direction === Direction.Right) && !acceptedDirections.get(Direction.Left))
                ) {
                    acceptedDirections.set(directionState.direction, true);

                    return true;
                }
                else {
                    return false;
                }
            }
        );

        return directionStatesWithoutConflicts;
    }
}
