var _ = require('underscore');
var expect = require('chai').expect;

var Action = require('../src/Action');
var LinePath = require('../src/LinePath');

describe('LinePath', function() {
    describe('#getPath()', function () {
        it ('creates a path with the specified number of steps', function() {
            var linePath = new LinePath({
                start: [0.0, 0.0],
                end: [100.0, 100.0]
            });

            var numberOfSteps = 10;
            var path = linePath.getPath(numberOfSteps);

            // A given number of steps require one additional point (fencepost analogy).
            expect(path.length).to.be.equal(numberOfSteps + 1);
        });

        it ('creates a path containing only movements when no other actions are specified in the template', function() {
            var linePath = new LinePath({
                start: [0.0, 0.0],
                end: [100.0, 100.0]
            });

            var path = linePath.getPath(10);

            // All steps that are movements.
            var movements = _.where(path, { action: Action.Move });

            expect(movements.length).to.be.equal(path.length);
        });

        it('creates paths that begin and terminate at the first and last provided points', function () {
            var linePath = new LinePath({
                start: [0.0, 0.0],
                end: [10.0, 30.0]
            });

            var path = linePath.getPath(10);

            expect(Math.round(path[0].location[0])).to.be.eql(0.0);
            expect(Math.round(path[0].location[1])).to.be.eql(0.0);

            expect(Math.round(path[10].location[0])).to.be.closeTo(10.0, 0.01);
            expect(Math.round(path[10].location[1])).to.be.closeTo(30.0, 0.01);
        });

        it('inserts non-movement actions at specified positions along the path', function() {
            var linePath = new LinePath({
                start: [0.0, 0.0],
                end: [100.0, 100.0],
                actions: [
                    [0.50, Action.Fire]
                ]
            });

            var path = linePath.getPath(10);

            // One extra step for the fire action.
            expect(path.length).to.be.equal(12);

            expect(path[5].action).to.be.equal(Action.Fire);
        });

        it('only generates coordinates between the start and end points', function() {
            var linePath = new LinePath({
                start: [10.0, 50.0],
                end: [40.0, 90.0]
            });

            var path = linePath.getPath(10);

            expect(
                _.every(
                    _.map(path, function(point) { return point.location[0]}),
                    function(value) { return (value >= 10.0) && (value <= 40.0); }
                )
            ).to.be.true;
            expect(
                _.every(
                    _.map(path, function(point) { return point.location[1]}),
                    function(value) { return (value >= 50.0) && (value <= 90.0); }
                )
            ).to.be.true;
        });
    });
});
