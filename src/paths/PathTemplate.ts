import {Point} from "../Point";
import {ScheduledAction} from "./ScheduledAction";

export class PathTemplate {
    private readonly _points: Point[];
    private readonly _scheduledActions: ScheduledAction[];

    constructor(points: Point[], scheduledActions: ScheduledAction[]) {
        this._points = points;
        this._scheduledActions = scheduledActions;
    }

    get points(): Point[] {
        return this._points;
    }

    get scheduledActions(): ScheduledAction[] {
        return this._scheduledActions;
    }
}
