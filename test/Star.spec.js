var expect = require('chai').expect;

var Star = require('../src/Star');

var WorldStubBuilder = require('./builders/WorldStubBuilder');

describe('Star', function() {
    describe('#tick()', function () {
        it('moves star downwards', function () {
            var world = new WorldStubBuilder().build();
            var star = new Star(world, 1, 1);

            star.tick();

            expect(star._y).to.be.above(1);
        });

        // it('cycles image frames to sparkle the star', function() {
        //     var world = new WorldStubBuilder().build();
        //     var star = new Star(world, 1, 1);
        //
        //     var initialFrame = star.getImageDetails().currentFrame;
        //
        //     var flickered = false;
        //     for (var i = 0; i < 10; i++) {
        //         star.tick();
        //         if (star.getImageDetails().currentFrame != initialFrame) {
        //             flickered = true;
        //         }
        //     }
        //
        //     expect(flickered).to.be.true;
        // });

        it('sets the star inactive when it leaves the world', function() {
            var world = new WorldStubBuilder().build();
            var star = new Star(world, 1, world.getDimensions().height);

            star.tick();

            expect(star.isActive()).to.be.false;
        })
    });
});
