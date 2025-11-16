import {describe} from 'mocha';
import {expect} from 'chai';

import {Point} from '../src/Point';

describe('Point', () => {
    describe('#ctor()', () => {
        it('defines a position', () => {
            const point = new Point(3, 4);
            expect(point.x).to.be.equal(3);
            expect(point.y).to.be.equal(4);
        });
    });

    describe('#withX()', () => {
        it('returns a new Point with the specified x coordinate', () => {
            const point = new Point(3, 4);
            const newPoint = point.withX(10);
            expect(newPoint.x).to.be.equal(10);
            expect(newPoint.y).to.be.equal(4);
        });
    });

    describe('#withY()', () => {
        it('returns a new Point with the specified y coordinate', () => {
            const point = new Point(3, 4);
            const newPoint = point.withY(10);
            expect(newPoint.x).to.be.equal(3);
            expect(newPoint.y).to.be.equal(10);
        });
    });

    describe('#translate()', () => {
        it('returns a new Point translated by the specified amounts', () => {
            const point = new Point(3, 4);
            const newPoint = point.translate(2, 3);
            expect(newPoint.x).to.be.equal(5);
            expect(newPoint.y).to.be.equal(7);
        });
    });

    describe('#up()', () => {
        it('returns a new Point moved upwards by the specified amount', () => {
            const point = new Point(3, 4);
            const newPoint = point.up(2);
            expect(newPoint.x).to.be.equal(3);
            expect(newPoint.y).to.be.equal(2);
        });
    });

    describe('#down()', () => {
        it('returns a new Point moved downwards by the specified amount', () => {
            const point = new Point(3, 4);
            const newPoint = point.down(2);
            expect(newPoint.x).to.be.equal(3);
            expect(newPoint.y).to.be.equal(6);
        });
    });

    describe('#left()', () => {
        it('returns a new Point moved left by the specified amount', () => {
            const point = new Point(3, 4);
            const newPoint = point.left(2);
            expect(newPoint.x).to.be.equal(1);
            expect(newPoint.y).to.be.equal(4);
        });
    });

    describe('#right()', () => {
        it('returns a new Point moved right by the specified amount', () => {
            const point = new Point(3, 4);
            const newPoint = point.right(2);
            expect(newPoint.x).to.be.equal(5);
            expect(newPoint.y).to.be.equal(4);
        });
    });

    describe('#equals()', () => {
        it('returns true for points with the same coordinates', () => {
            const point1 = new Point(3, 4);
            const point2 = new Point(3, 4);
            expect(point1.equals(point2)).to.be.true;
        });

        it('returns false for points with different coordinates', () => {
            const point1 = new Point(3, 4);
            const point2 = new Point(5, 4);
            const point3 = new Point(3, 6);
            expect(point1.equals(point2)).to.be.false;
            expect(point1.equals(point3)).to.be.false;
        });
    });
});
