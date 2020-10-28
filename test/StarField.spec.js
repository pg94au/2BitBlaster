var expect = require('chai').expect;

var Star = require('../src/Star');
var StarField = require('../src/StarField').StarField;

var ClockStubBuilder = require('./builders/ClockStubBuilder');
var WorldStubBuilder = require('./builders/WorldStubBuilder');

describe('StarField', function() {
    describe('#tick()', function () {
        it('populates the world with multiple stars on first call', function () {
            var world = new WorldStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var starField = new StarField(world, clock);

            starField.tick();

            expect(world.getActors().length).to.be.above(10);
        });

        it('adds stars periodically on subsequent ticks', function() {
            var world = new WorldStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var starField = new StarField(world, clock);

            var starAdded = false;
            starField.tick();
            clock.addSeconds(10);
            world.addActor = function(actor) { if (actor instanceof Star) { starAdded = true; }};
            starField.tick();

            expect(starAdded).to.be.true;

        });
    });
});
