import * as PIXI from "pixi.js";
import {Actor} from "../Actor";

export class SpriteDetail {
    private _frameTextures: PIXI.Texture[] = [];
    private readonly _sprite: PIXI.Sprite;
    private _imageName: string = '';

    constructor(private readonly _spriteSheets: Map<string, PIXI.Texture>, private _actor: Actor) {
        this.updateTextures();
        this._sprite = new PIXI.Sprite(this._frameTextures[this._actor.getImageDetails().currentFrame]);
        this.updatePosition();
    }

    updateTextures(): void {
        if (this._actor.getImageDetails().name !== this._imageName) {
            this._imageName = this._actor.getImageDetails().name;
            this._frameTextures = [];
            for (let index = 0; index < this._actor.getImageDetails().numberOfFrames; index++) {
                this._frameTextures.push(
                    new PIXI.Texture(
                        this._spriteSheets.get(this._actor.getImageDetails().name)!.baseTexture,
                        new PIXI.Rectangle(
                            index * this._actor.getImageDetails().frameWidth,
                            0,
                            this._actor.getImageDetails().frameWidth,
                            this._spriteSheets.get(this._actor.getImageDetails().name)!.height
                        )
                    )
                );
            }
        }
    }

    updatePosition(): void {
        this._sprite.anchor.set(0.5);
        this._sprite.position.x = this._actor.getCoordinates().x;
        this._sprite.position.y = this._actor.getCoordinates().y;
        this._sprite.zIndex = this._actor.zIndex;
    }

    updateSprite(): void {
        this.updateTextures();
        this._sprite.texture = this._frameTextures[this._actor.getImageDetails().currentFrame];
        this.updatePosition();
    }

    get sprite(): PIXI.Sprite {
        return this._sprite;
    }
}
