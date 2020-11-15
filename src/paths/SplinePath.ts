import Debug from "debug";
import {PathEntry} from "./PathEntry";
import {PathAction} from "./PathAction";
import {PathTemplate} from "./PathTemplate";
import bspline from 'b-spline';
import {Point} from "../Point";

const debug = Debug("Blaster:Paths:SplinePath");

export class SplinePath {
    private readonly _pathTemplate: PathTemplate;
    private readonly _order: number = 3;
    private readonly _knots: number[];

    constructor(pathTemplate: PathTemplate) {
        this._pathTemplate = pathTemplate;

        this._knots = this.createKnots(pathTemplate.points.length, this._order);
    }

    private createKnots(numberOfPoints: number, order: number): number[] {
        // Knots are computed to generate a spline that is fixed to both end points, with
        // evenly distributed computed points.
        const knots: number[] = [];

        for (let i=0; i < order; i++) {
            knots.push(0);
        }

        for (let i=1; i <= numberOfPoints - order; i++) {
            knots.push(i);
        }

        for (let i=0; i < order; i++) {
            knots.push(numberOfPoints - order + 1);
        }

        return knots;
    }

    getPath(numberOfSteps: number): PathEntry[] {
        if (numberOfSteps === undefined) {
            throw new Error('numberOfSteps cannot be undefined');
        }

        const path: PathEntry[] = [];

        const stepSize = 1.0 / numberOfSteps;
        for (let currentStep = 0; currentStep <= numberOfSteps; currentStep++) {
            const t = currentStep * stepSize;

            // bspline accepts points in the form [[x1, y1], [x2, y2], ...] so we need to convert from a collection of Point
            const pointsAsArray: ArrayLike<number>[] = this._pathTemplate.points.map(p => { return [p.x, p.y] });

            // bspline will return a point in the form [x, y], so it will have to converted to a Point
            const point = bspline(t, this._order - 1, pointsAsArray, this._knots);

            const pathEntry = new PathEntry(PathAction.Move, new Point(Math.round(point[0]), Math.round(point[1])));

            path.push(pathEntry);
        }

        if (this._pathTemplate.scheduledActions) {
            for (const scheduledAction of this._pathTemplate.scheduledActions) {
                // Create the new action entry.
                const actionEntry = new PathEntry(scheduledAction.action, null);

                // Figure out what offset to include it at.
                const stepPosition = Math.floor(numberOfSteps * scheduledAction.when);

                // Insert it at that position.
                path.splice(stepPosition, 0, actionEntry);
            }
        }

        return path;
    }

    static mirrorPath(originalPath: PathEntry[]): PathEntry[] {
        const mirroredPath: PathEntry[] = [];
        for (const pathEntry of originalPath) {
            switch (pathEntry.action) {
                case PathAction.Move:
                    const mirrored = new PathEntry(PathAction.Move, new Point(-pathEntry.location!.x, pathEntry.location!.y));
                    mirroredPath.push(mirrored);
                    break;
                case PathAction.Fire:
                    mirroredPath.push(pathEntry);
                    break;
            }
        }

        return mirroredPath;
    }

    static translatePath(originalPath: PathEntry[], xOffset: number, yOffset: number): PathEntry[] {
        const translatedPath: PathEntry[] = [];
        for (const pathEntry of originalPath) {
            switch(pathEntry.action) {
                case PathAction.Move:
                    const translatedPathEntry = new PathEntry(
                        pathEntry.action,
                        new Point(pathEntry.location!.x + xOffset, pathEntry.location!.y + yOffset)
                    );
                    translatedPath.push(translatedPathEntry);
                    break;
                case PathAction.Fire:
                    translatedPath.push(pathEntry);
                    break;
            }
        }

        return translatedPath;
    }
}
