var expect = require('chai').expect;

var TextInterlude = require('../src/TextInterlude');

var ClockStubBuilder = require('./builders/ClockStubBuilder');
var WorldStubBuilder = require('./builders/WorldStubBuilder');

describe('TextInterlude', function() {
    describe('#ctor()', function () {
        it('starts in an active state', function () {
            var world = new WorldStubBuilder().build();
            var clock = new ClockStubBuilder().build();
            var textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 3, 4, 5);

            expect(textInterlude.isActive()).to.be.true;
        });
    });

    describe('#tick()', function() {
        it('does not immediately display text', function() {
            var textAdded = false;
            var world = new WorldStubBuilder().build();
            world.addText = function(text) { textAdded = true; };
            var clock = new ClockStubBuilder().build();
            var textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();

            expect(textInterlude.isActive()).to.be.true;
            expect(textAdded).to.be.false;
        });

        it('displays text after an initial delay', function() {
            var addedText = undefined;
            var world = new WorldStubBuilder().build();
            world.addText = function(text) { addedText = text; };
            var clock = new ClockStubBuilder().build();
            var textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.isActive()).to.be.true;
            expect(addedText).to.be.not.undefined;
            expect(addedText.isActive()).to.be.true;
        });

        it('removes text after it has been displayed for a period of time', function() {
            var addedText = undefined;
            var world = new WorldStubBuilder().build();
            world.addText = function(text) { addedText = text; };
            var clock = new ClockStubBuilder().build();
            var textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.isActive()).to.be.true;
            expect(addedText.isActive()).to.be.false;
        });

        it('becomes inactive after a period after text is removed', function() {
            var world = new WorldStubBuilder().build();
            world.addText = function(text) {};
            var clock = new ClockStubBuilder().build();
            var textInterlude = new TextInterlude(world, clock, "TEST", "FONT", "COLOR", 1, 2, 2000, 4000, 2000);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();
            clock.addSeconds(3);
            textInterlude.tick();

            expect(textInterlude.isActive()).to.be.false;
        });
    });
});
