var _ = require('underscore');
var expect = require('chai').expect;

var Action = require('../src/Action');
var SplinePath = require('../src/SplinePath');

describe('SplinePath', function() {
    describe('#getPath()', function () {
        it ('creates a path with the specified number of steps', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ]
            });

            var numberOfSteps = 10;
            var path = splinePath.getPath(numberOfSteps);

            // A given number of steps require one additional point (fencepost analogy).
            expect(path.length).to.be.equal(numberOfSteps + 1);
        });

        it ('creates a path containing only movements when no other actions are specified in the template', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            // All steps that are movements.
            var movements = _.where(path, { action: Action.Move });

            expect(movements.length).to.be.equal(path.length);
        });

        it('creates paths that begin and terminate at the first and last provided points', function () {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            expect(Math.round(path[0].location[0])).to.be.eql(0.0);
            expect(Math.round(path[0].location[1])).to.be.eql(0.0);

            expect(Math.round(path[10].location[0])).to.be.closeTo(10.0, 0.01);
            expect(Math.round(path[10].location[1])).to.be.closeTo(30.0, 0.01);
        });

        it('inserts non-movement actions at specified positions along the path', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ],
                actions: [
                    [0.50, Action.Fire]
                ]
            });

            var path = splinePath.getPath(10);

            // One extra step for the fire action.
            expect(path.length).to.be.equal(12);

            expect(path[5].action).to.be.equal(Action.Fire);
        });
    });

    describe('#mirrorPath', function() {
        it('creates a new path with the same length as the provided path', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [-5.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            var mirroredPath = SplinePath.mirrorPath(path);

            expect(mirroredPath.length).to.be.equal(path.length);
        });

        it('creates new path with the x-coordinate of each point mirrored in the y-axis', function () {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [-5.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            var mirroredPath = SplinePath.mirrorPath(path);

            for (var i=0; i < path.length; i++) {
                expect(path[i].location[0]).to.be.equal(-mirroredPath[i].location[0]);
            }
        });

        it('should not affect the y-coordinates of any point in the path', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [-5.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            var mirroredPath = SplinePath.mirrorPath(path);

            for (var i=0; i < path.length; i++) {
                expect(path[i].location[1]).to.be.equal(mirroredPath[i].location[1]);
            }
        });

        it('should include all actions from the provided path', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ],
                actions: [
                    [0.50, Action.Fire]
                ]
            });

            var path = splinePath.getPath(10);

            var mirroredPath = SplinePath.mirrorPath(path);

            expect(mirroredPath[5].action).to.be.equal(Action.Fire);
        });
    });

    describe('#mirrorPath', function() {
        it('should generate a new path with the same length as the original', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            var translatedPath = SplinePath.translatePath(path, 3, 7);

            expect(translatedPath.length).to.be.equal(path.length);
        });

        it('should translate every coordinate by the x and y offsets', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ]
            });

            var path = splinePath.getPath(10);

            var translatedPath = SplinePath.translatePath(path, 3, 7);

            for (var i = 0; i < path.length; i++) {
                expect(translatedPath[i].location[0]).to.be.equal(path[i].location[0] + 3);
                expect(translatedPath[i].location[1]).to.be.equal(path[i].location[1] + 7);
            }
        });

        it('should copy actions without modification', function() {
            var splinePath = new SplinePath({
                points: [
                    [0.0, 0.0],
                    [5.0, 20.0],
                    [10.0, 30.0]
                ],
                actions: [
                    [0.50, Action.Fire]
                ]
            });

            var path = splinePath.getPath(10);

            var translatedPath = SplinePath.translatePath(path, 3, 7);

            expect(translatedPath[5].action).to.be.equal(Action.Fire);
        });
    });
});
