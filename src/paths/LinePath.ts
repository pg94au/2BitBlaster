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

    getPath(numberOfSteps: number): PathEntry[] {
        let path: PathEntry[] = [];

        let stepSize = 1.0 / numberOfSteps;
        for (let currentStep = 0; currentStep <= numberOfSteps; currentStep++) {
            let t = currentStep * stepSize;
            let x = this._start.x + Math.round((this._end.x - this._start.x) * t);
            let y = this._start.y + Math.round((this._end.y - this._start.y) * t);

            let pathEntry = new PathEntry(PathAction.Move, new Point(x, y));
            path.push(pathEntry);
        }

        if (this._scheduledActions) {
            for (let i = 0; i < this._scheduledActions.length; i++) {
                // Create the new action entry.
                let pathEntry = new PathEntry(this._scheduledActions[i].action, null);

                // Figure out what offset to include it at.
                let stepPosition = Math.floor(numberOfSteps * this._scheduledActions[i].when);

                // Insert it at that position.
                path.splice(stepPosition, 0, pathEntry);
            }
        }

        return path;
    };
}
