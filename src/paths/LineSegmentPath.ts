import Debug from "debug";
import {Point} from "../Point";
import {ScheduledAction} from "./ScheduledAction";
import {PathEntry} from "./PathEntry";
import {LinePath} from "./LinePath";

const debug = Debug("Blaster:Paths:LinePath");

export class LineSegmentPath {
    private readonly _points: Point[];
    private readonly _scheduledActions: ScheduledAction[];

    constructor(points: Point[], scheduledActions: ScheduledAction[]) {
        this._points = points;
        this._scheduledActions = scheduledActions;
    }

    private getSegmentLength(point1: Point, point2: Point): number {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getPath(numberOfSteps: number): PathEntry[] {
        const path: PathEntry[] = [];

        const stepSize = 1.0 / numberOfSteps;

        let totalLength: number = 0;
        for (let i = 0; i < this._points.length - 1; i++) {
            totalLength += this.getSegmentLength(this._points[i], this._points[i + 1]);
        }

        // foreach segment
        //  determine ratio of this segment to total length
        //   create line path for this segment with number of points based on ratio
        //   add path to a total path
        for (let i = 0; i < this._points.length - 1; i++) {
            const segmentLength = this.getSegmentLength(this._points[i], this._points[i + 1]);
            const segmentNumberOfSteps = Math.round(segmentLength / totalLength * numberOfSteps);

            const linePath = new LinePath(this._points[i], this._points[i + 1], []);
            const segmentPath = linePath.getPath(segmentNumberOfSteps);

            // The end of each segment is the same as the start of the next segment, so we don't want to duplicate it.
            path.pop();
            path.push(...segmentPath);
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
