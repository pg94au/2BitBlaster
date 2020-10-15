var expect = require('chai').expect;

var Level = require('../src/Level');

describe('Level', function() {
    describe('#ctor()', function () {
        it('starts in an active state', function () {
            var level = new Level([]);
            expect(level.isActive()).to.be.true;
        });
    });

    describe('#tick()', function() {
        it('starts calling tick with the first wave', function() {
            var wave1Ticked = false;
            var wave1 = {
                isActive: function() { return true; },
                tick: function() { wave1Ticked = true; }
            };
            var wave2 = {};
            var level = new Level([wave1, wave2]);
            level.tick();
            expect(wave1Ticked).to.be.true;
        });

        it ('switches to ticking the next wave after each wave becomes inactive', function() {
            var wave2Ticked = false;
            var wave1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var wave2 = {
                isActive: function() { return true; },
                tick: function() { wave2Ticked = true; }
            };
            var level = new Level([wave1, wave2]);
            level.tick();
            level.tick();
            expect(wave2Ticked).to.be.true;
        });

        it('becomes inactive when the last wave becomes inactive', function() {
            var wave1 = {
                isActive: function() { return false; },
                tick: function() {}
            };
            var level = new Level([wave1]);
            level.tick();
            level.tick();
            expect(level.isActive()).to.be.false;
        });
    });
});