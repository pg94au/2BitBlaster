import Debug from "debug";
const debug = Debug("Blaster:World");

import {Actor} from "./Actor";
import {Dimensions} from './Dimensions'
import {Enemy} from './enemies/Enemy';
import {Explosion} from './Explosion';
import {Player} from './Player';
import {ScoreCounter} from "./ScoreCounter";
import {Text} from './Text';

export class World {
    private readonly _dimensions: Dimensions;
    private readonly _scoreCounter: ScoreCounter;
    private _actors: Actor[] = [];
    private _texts: Text[] = [];

    // TODO: Change constructor to accept Dimensions as parameter type
    constructor(width: number, height: number, scoreCounter: ScoreCounter) {
        debug('World: constructor');
        this._dimensions = new Dimensions(width, height);
        this._scoreCounter = scoreCounter;
    }

    getDimensions(): Dimensions {
        return this._dimensions;
    }

    addActor(actor: Actor): void {
        debug('World.addActor: %o', actor);
        if (this._actors.find(existing => { return existing.getId() === actor.getId() })) {
            throw new Error('Cannot add same actor twice.');
        }
        this._actors.push(actor);
    }

    addText(text: Text): void {
        debug('World.addText: %o', text);
        if (this._texts.find(existing => { return existing.id === text.id })) {
            throw new Error('Cannot add same text twice.');
        }
        this._texts.push(text);
    }

    getActors(): Actor[] {
        return this._actors;
    }

    getActiveEnemies(): Enemy[] {
        return this._actors.filter(
            (actor): actor is Enemy => { return actor instanceof Enemy && actor.isActive() }
            );
    }

    getActiveExplosions(): Explosion[] {
        return this._actors.filter(
            (actor): actor is Explosion => { return actor instanceof Explosion && actor.isActive() }
            );
    }

    getPlayer(): Player | null {
        return this._actors.find((actor): actor is Player => { return actor instanceof Player }) || null;
    }

    getScoreCounter(): ScoreCounter {
        return this._scoreCounter;
    }

    getTexts(): Text[] {
        return this._texts;
    }

    tick(): void {
        debug('World.tick');
        for (const actor of this._actors) {
            debug('World.tick: ticking %o', actor);
            actor.tick();
        }
        //TODO: Texts could be ticked as well, so that they can animate if necessary.
        this.cleanUp();
    }

    cleanUp(): void {
        debug('World.cleanUp: before is %o', this._actors);

        this._actors =  this._actors.filter(actor => { return actor.isActive() });
        this._texts = this._texts.filter(text => { return text.active });

        debug('World.cleanUp: after is %o', this._actors);
    }
}
