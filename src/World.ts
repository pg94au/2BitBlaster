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
        if (this._texts.find(existing => { return existing.id == text.id })) {
            throw new Error('Cannot add same text twice.');
        }
        this._texts.push(text);
    }

    getActors(): Actor[] {
        return this._actors;
    }

    getActiveEnemies(): Enemy[] {
        let activeEnemies: Enemy[] = [];
        for (let i=0; i < this._actors.length; i++) {
            if (this._actors[i].isActive()) {
                if (this._actors[i] instanceof Enemy) {
                    activeEnemies.push(<Enemy>this._actors[i]);
                }
            }
        }

        return activeEnemies;
    }

    getActiveExplosions(): Explosion[] {
        let activeExplosions: Explosion[] = [];
        for (let i=0; i < this._actors.length; i++) {
            if (this._actors[i].isActive()) {
                if (this._actors[i] instanceof Explosion) {
                    activeExplosions.push(<Explosion>this._actors[i]);
                }
            }
        }

        return activeExplosions;
    }

    getPlayer(): Player | null {
        let player: Player | null = null;
        for (let i=0; i < this._actors.length; i++) {
            if (this._actors[i] instanceof Player) {
                player = <Player>this._actors[i];
            }
        }

        return player;
    }

    getScoreCounter(): ScoreCounter {
        return this._scoreCounter;
    }

    getTexts(): Text[] {
        return this._texts;
    }

    tick(): void {
        debug('World.tick');
        for (let i=0; i < this._actors.length; i++) {
            let actor = this._actors[i];
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
