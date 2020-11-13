import Debug from "debug";
const debug = Debug("Blaster:Renderer");
import {sortBy} from 'underscore';

import * as PIXI from "pixi.js";
import {World} from "../World";
import {Dimensions} from "../Dimensions";
import {ImageDetails} from "../ImageDetails";
import {Actor} from "../Actor";

class SpriteDetail {
    private readonly _frameTextures: PIXI.Texture[] = [];
    private readonly _sprite: PIXI.Sprite;
    private _imageName: string = '';

    constructor(private readonly _spriteSheets: Map<string, PIXI.Texture>, private _actor: Actor) {
        this.updateTextures();
        this._sprite = new PIXI.Sprite(this._frameTextures[this._actor.getImageDetails().currentFrame]);
        this.updatePosition();
    }

    updateTextures(): void {
        if (this._actor.getImageDetails().name != this._imageName) {
            this._imageName = this._actor.getImageDetails().name;
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
        this._sprite.zIndex = this._actor.getZIndex();
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

export class Renderer {
    private readonly _containerElement!: HTMLElement;
    private _world!: World;
    private _worldDimensions!: Dimensions;
    private _renderer: any;
    private _stage!: PIXI.Container;
    private _activeSprites: Map<string, SpriteDetail> = new Map<string, SpriteDetail>();
    private _activeTexts: any = {};
    private _preloadedImages: Map<string, PIXI.Texture> = new Map<string, PIXI.Texture>();

    constructor(containerElement: HTMLElement) {
        this._containerElement = containerElement;
    }

    preLoadImages(images: any[], onLoaded: () => void) {
        let loader = PIXI.Loader.shared;
        for (let image of images) {
            loader.add(image.name, image.url);
        }
        loader.onComplete.add(() => { onLoaded() });
        loader.load((loader, resources) => {
            let resourceNames = Object.getOwnPropertyNames(resources);
            for (let resourceName of resourceNames) {
                let texture: PIXI.Texture = resources[resourceName]!.texture;
                this._preloadedImages.set(resourceName, texture);
            }
        });
    }

    initialize(world: World): void {
        this._world = world;
        this._worldDimensions = this._world.getDimensions();
        this._renderer = PIXI.autoDetectRenderer({
            width: this._worldDimensions.width,
            height: this._worldDimensions.height
        });
        this._renderer.backgroundColor = 0x000000;
        this._containerElement.appendChild(this._renderer.view);
        this._stage = new PIXI.Container();
        this._renderer.backgroundColor = 0x061639;
        this._renderer.render(this._stage);
    }

    destroy(): void {
        while (this._containerElement.firstChild) {
            this._containerElement.removeChild(this._containerElement.firstChild);
        }
    }

    destroyTextures(): void {
        // TODO: Call this method if necessary when navigating from this page.
        for (let texture of Object.keys(PIXI.utils.TextureCache)) {
            PIXI.utils.TextureCache[texture].destroy(true);
        }
    }

    render() {
        this.setScale();

        this.addAnyUnrenderedNewSpritesToStage();

        this.addAnyUnrenderedNewTextToStage();

        this.cleanUpInactiveActors();

        this.cleanUpInactiveText();

        this.sortSpritesByActorZOrder();

        this._renderer.render(this._stage);
    }

    setScale() {
        let height = this._containerElement.clientHeight;
        let width = this._containerElement.clientWidth;

        let scale = height / this._worldDimensions.height;

        this._stage.scale.x = scale;
        this._stage.scale.y = scale;

        this._renderer.resize(width, height);
    }

    addAnyUnrenderedNewSpritesToStage() {
        let actors = this._world.getActors();
        for (let actor of actors) {
            let spriteDetail : SpriteDetail | undefined = this._activeSprites.get(actor.getId());

            // Add a new sprite for this actor if one does not already exist.
            if (!spriteDetail) {
                spriteDetail = new SpriteDetail(this._preloadedImages, actor);
                this._activeSprites.set(actor.getId(), spriteDetail);
                this._stage.addChild(spriteDetail.sprite);
            }

            spriteDetail.updateSprite();
        }
    }

    addAnyUnrenderedNewTextToStage(): void {
        // Add any text that hasn't yet been rendered.
        for (let text of this._world.getTexts()) {
            let pixiText = this._activeTexts[text.id];
            if (pixiText == null) {
                pixiText = new PIXI.Text(text.content, {font: text.font, fill: text.color});
                pixiText.anchor.x = 0.5;
                pixiText.anchor.y = 0.5;
                let textCoordinates = text.coordinates;
                pixiText.position.x = textCoordinates.x;
                pixiText.position.y = textCoordinates.y;
                pixiText.zIndex = 1000000; // Always on top
                this._activeTexts[text.id] = pixiText;
                this._stage.addChild(pixiText);
            }
        }
    }

    cleanUpInactiveActors(): void {
        // Remove any sprites whose associated actors no longer exist.
        this._activeSprites.forEach((spriteDetail: SpriteDetail, actorId: string) => {
            // Check if there exists an actor with id == actorId.
            if (!this._world.getActors().find(actor => { return actor.getId() == actorId })) {
                this._stage.removeChild(spriteDetail.sprite);
                this._activeSprites.delete(actorId);
            }
        });
    }

    cleanUpInactiveText() {
        // Remove any text were the associated text items no longer exist.
        for (let textId in this._activeTexts) {
            if (this._activeTexts.hasOwnProperty(textId)) {
                // Check if there exists a text with id == textId.
                if (this._world.getTexts().find(textItem => { return textItem.id == textId })) {
                    this._stage.removeChild(this._activeTexts[textId]);
                    delete this._activeTexts[textId];
                }
            }
        }
    }

    sortSpritesByActorZOrder() {
        // Sort sprites so that they get rendered in the z-order that's been specified by each actor.
        sortBy(this._stage.children, child => {
            child.zIndex = child.zIndex || 0;
            return child.zIndex;
        });
    }
}
