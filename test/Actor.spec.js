import {Point} from "../src/Point";

var expect = require('chai').expect;

var Actor = require('../src/Actor');
var Direction = require('../src/devices/Direction');

describe('Actor', function() {
    describe('#ctor()', function() {
        it('should start active', function () {
            var actor = new Actor({}, 1, 2);
            expect(actor.isActive()).to.be.true;
        });

        it('should start at specified coordinates', function() {
            var actor = new Actor({}, 12, 23);
            expect(actor.getCoordinates()).to.eql(new Point(12, 23));
        });
    });

    describe('#getId()', function() {
        it('should return a new value for every instance', function() {
            var actor1 = new Actor({}, 1, 2);
            var actor2 = new Actor({}, 1, 2);
            expect(actor2.getId()).to.not.equal(actor1.getId());
        });
    });

    describe('#getImageDetails()', function() {
        it('must be overridden in subclasses', function() {
            var actor = new Actor({}, 1, 2);
            expect(actor.getImageDetails).to.throw('Must implement getImageDetails');
        });
    });

    describe('#getZIndex()', function() {
        it('must be overridden in a subclass', function() {
            var actor = new Actor({}, 1, 2);
            expect(actor.getZIndex).to.throw('Must implement getZIndex');
        });
    });

    describe('#hitBy()', function() {
        it('returns false if not overridden', function() {
            var actor = new Actor({}, 1, 2);
            expect(actor.hitBy({}, 1)).to.be.false;
        });
    });

    describe('#move()', function() {
        it('should decrement y position when moving up', function() {
            var actor = new Actor({}, 100, 100);
            actor.move(Direction.Up);
            expect(actor.getCoordinates().y).to.be.below(100);
        });

        it('should increment y position when moving down', function() {
            var actor = new Actor({}, 100, 100);
            actor.move(Direction.Down);
            expect(actor.getCoordinates().y).to.be.above(100);
        });

        it('should decrement x position when moving left', function() {
            var actor = new Actor({}, 100, 100);
            actor.move(Direction.Left);
            expect(actor.getCoordinates().x).to.be.below(100);
        });

        it('should incrmenet x position when moving right', function() {
            var actor = new Actor({}, 100, 100);
            actor.move(Direction.Right);
            expect(actor.getCoordinates().x).to.be.above(100);
        });
    });
});
