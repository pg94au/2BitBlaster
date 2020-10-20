import {describe} from 'mocha';
import {expect} from 'chai';

import {PathAction} from "../../src/paths/PathAction";
import {PathEntry} from "../../src/paths/PathEntry";
import {Point} from "../../src/Point";
import {ScheduledAction} from "../../src/paths/ScheduledAction";
import {SplinePath} from "../../src/paths/SplinePath";
import {PathTemplate} from "../../src/paths/PathTemplate";

describe('SplinePath', () => {
    describe('#getPath()', () => {
        it ('creates a path with the specified number of steps', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    []
                )
            );

            let numberOfSteps = 10;
            let path = splinePath.getPath(numberOfSteps);

            // A given number of steps require one additional point (fencepost analogy).
            expect(path.length).to.be.equal(numberOfSteps + 1);
        });

        it ('creates a path containing only movements when no other actions are specified in the template', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            // All steps that are movements.
            let movements = path.filter((pathEntry: PathEntry): boolean => { return pathEntry.action === PathAction.Move });

            expect(movements.length).to.be.equal(path.length);
        });

        it('creates paths that begin and terminate at the first and last provided points', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            expect(Math.round(path[0].location!.x)).to.be.eql(0.0);
            expect(Math.round(path[0].location!.y)).to.be.eql(0.0);

            expect(Math.round(path[10].location!.x)).to.be.closeTo(10.0, 0.01);
            expect(Math.round(path[10].location!.y)).to.be.closeTo(30.0, 0.01);
        });

        it('inserts non-movement actions at specified positions along the path', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    [
                        new ScheduledAction(0.50, PathAction.Fire)
                    ]
                )
            );

            let path = splinePath.getPath(10);

            // One extra step for the fire action.
            expect(path.length).to.be.equal(12);

            expect(path[5].action).to.be.equal(PathAction.Fire);
        });
    });

    describe('#mirrorPath', function() {
        it('creates a new path with the same length as the provided path', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(-5.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            let mirroredPath = SplinePath.mirrorPath(path);

            expect(mirroredPath.length).to.be.equal(path.length);
        });

        it('creates new path with the x-coordinate of each point mirrored in the y-axis', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(-5.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            let mirroredPath = SplinePath.mirrorPath(path);

            for (let i=0; i < path.length; i++) {
                expect(path[i].location!.x).to.be.equal(-mirroredPath[i].location!.y);
            }
        });

        it('should not affect the y-coordinates of any point in the path', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(-5.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            let mirroredPath = SplinePath.mirrorPath(path);

            for (let i=0; i < path.length; i++) {
                expect(path[i].location!.y).to.be.equal(mirroredPath[i].location!.y);
            }
        });

        it('should include all actions from the provided path', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    [
                        new ScheduledAction(0.50, PathAction.Fire)
                    ]
                )
            );

            let path = splinePath.getPath(10);

            let mirroredPath = SplinePath.mirrorPath(path);

            expect(mirroredPath[5].action).to.be.equal(PathAction.Fire);
        });
    });

    describe('#mirrorPath', function() {
        it('should generate a new path with the same length as the original', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            let translatedPath = SplinePath.translatePath(path, 3, 7);

            expect(translatedPath.length).to.be.equal(path.length);
        });

        it('should translate every coordinate by the x and y offsets', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    []
                )
            );

            let path = splinePath.getPath(10);

            let translatedPath = SplinePath.translatePath(path, 3, 7);

            for (let i = 0; i < path.length; i++) {
                expect(translatedPath[i].location!.x).to.be.equal(path[i].location!.x + 3);
                expect(translatedPath[i].location!.y).to.be.equal(path[i].location!.y + 7);
            }
        });

        it('should copy actions without modification', () => {
            let splinePath = new SplinePath(
                new PathTemplate(
                    [
                        new Point(0.0, 0.0),
                        new Point(5.0, 20.0),
                        new Point(10.0, 30.0)
                    ],
                    [
                        new ScheduledAction(0.50, PathAction.Fire)
                    ]
                )
            );

            let path = splinePath.getPath(10);

            let translatedPath = SplinePath.translatePath(path, 3, 7);

            expect(translatedPath[5].action).to.be.equal(PathAction.Fire);
        });
    });
});
