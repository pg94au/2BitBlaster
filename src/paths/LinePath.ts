import Debug from "debug";
import {Point} from "../Point";
import {ScheduledAction} from "./ScheduledAction";
import {PathEntry} from "./PathEntry";
import {PathAction} from "./PathAction";

const debug = Debug("Blaster:Paths:LinePath");

export class LinePath {
    private readonly _start: Point;
    private readonly _end: Point;
    private readonly _scheduledActions: ScheduledAction[];

    constructor(start: Point, end: Point, scheduledActions: ScheduledAction[]) {
        this._start = start;
        this._end = end;
        this._scheduledActions = scheduledActions;
    }

    getPathForSpeed(speed: number): PathEntry[] {
        var lineLength = Math.sqrt(
            Math.pow(this._end.x - this._start.x, 2) +
            Math.pow(this._end.y - this._start.y, 2)
        );
        var numberOfSteps = Math.max(Math.floor(lineLength / speed), 1);

        return this.getPathForSteps(numberOfSteps);
    }

    getPathForSteps(numberOfSteps: number): PathEntry[] {
        const path: PathEntry[] = [];

        const stepSize = 1.0 / numberOfSteps;
        for (let currentStep = 0; currentStep <= numberOfSteps; currentStep++) {
            const t = currentStep * stepSize;
            const x = this._start.x + Math.round((this._end.x - this._start.x) * t);
            const y = this._start.y + Math.round((this._end.y - this._start.y) * t);

            const pathEntry = new PathEntry(PathAction.Move, new Point(x, y));
            path.push(pathEntry);
        }

        if (this._scheduledActions) {
            for (const scheduledAction of this._scheduledActions) {
                // Create the new action entry.
                const pathEntry = new PathEntry(scheduledAction.action, null);

                // Figure out what offset to include it at.
                const stepPosition = Math.floor(numberOfSteps * scheduledAction.when);

                // Insert it at that position.
                path.splice(stepPosition, 0, pathEntry);
            }
        }

        return path;
    };
}
