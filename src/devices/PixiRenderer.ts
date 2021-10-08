import Debug from "debug";
const debug = Debug("Blaster:Renderer");
import {sortBy} from 'underscore';

import * as PIXI from "pixi.js";
import {World} from "../World";
import {Dimensions} from "../Dimensions";
import {SpriteDetail} from "./SpriteDetail";
import {Renderer} from "./Renderer";

export class PixiRenderer implements Renderer {
    private readonly _containerElement!: HTMLElement;
    private _world!: World;
    private _worldDimensions!: Dimensions;
    private _renderer!: PIXI.AbstractRenderer;//PIXI.Renderer;
    private _stage!: PIXI.Container;
    private _isActiveSprites: Map<string, SpriteDetail> = new Map<string, SpriteDetail>();
    private _isActiveTexts: Map<string, PIXI.Text> = new Map<string, PIXI.Text>();
    private _preloadedImages: Map<string, PIXI.Texture> = new Map<string, PIXI.Texture>();

    constructor(containerElement: HTMLElement) {
        this._containerElement = containerElement;
    }

    preLoadImages(images: any[], onLoaded: () => void) {
        const loader = PIXI.Loader.shared;
        for (const image of images) {
            loader.add(image.name, image.url);
        }
        loader.onComplete.add(() => { onLoaded() });
        loader.load((byLoader, resources) => {
            const resourceNames = Object.getOwnPropertyNames(resources);
            for (const resourceName of resourceNames) {
                const texture: PIXI.Texture = resources[resourceName]!.texture!;
                this._preloadedImages.set(resourceName, texture);
            }
        });
    }

    initialize(world: World): void {
        this._world = world;
        this._worldDimensions = this._world.dimensions;
        this._renderer = PIXI.autoDetectRenderer({
            width: this._worldDimensions.width,
            height: this._worldDimensions.height
        });
        this._renderer.backgroundColor = 0x000000;
        this._containerElement.appendChild(this._renderer.view);
        this._stage = new PIXI.Container();
        this._stage.sortableChildren = true;
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
        for (const texture of Object.keys(PIXI.utils.TextureCache)) {
            PIXI.utils.TextureCache[texture].destroy(true);
        }
    }

    render() {
        this.setScale();

        this.addOrUpdateSpritesInStage();

        this.addAnyUnrenderedNewTextToStage();

        this.cleanUpInactiveActors();

        this.cleanUpInactiveText();

        this.sortSpritesByActorZOrder();

        this._renderer.render(this._stage);
    }

    private setScale() {
        const height = this._containerElement.clientHeight;
        const width = this._containerElement.clientWidth;

        const scale = height / this._worldDimensions.height;

        this._stage.scale.x = scale;
        this._stage.scale.y = scale;

        this._renderer.resize(width, height);
    }

    private addOrUpdateSpritesInStage() {
        const actors = this._world.actors;
        for (const actor of actors) {
            let spriteDetail : SpriteDetail | undefined = this._isActiveSprites.get(actor.id);

            // Add a new sprite for this actor if one does not already exist.
            if (!spriteDetail) {
                spriteDetail = new SpriteDetail(this._preloadedImages, actor);
                this._isActiveSprites.set(actor.id, spriteDetail);
                this._stage.addChild(spriteDetail.sprite);
            }

            spriteDetail.updateSprite();
        }
    }

    private addAnyUnrenderedNewTextToStage(): void {
        // Add any text that hasn't yet been rendered.
        const texts = this._world.texts;
        for (const text of texts) {
            let pixiText : PIXI.Text | undefined = this._isActiveTexts.get(text.id);

            // Add a new text if one does not already exist.
            if (!pixiText) {
                pixiText = new PIXI.Text(
                    text.content,
                    new PIXI.TextStyle({fontFamily: text.fontFamily, fontSize: text.fontSize, fill: text.fillColor})
                );
                pixiText.anchor.x = 0.5;
                pixiText.anchor.y = 0.5;
                pixiText.position.x = text.coordinates.x;
                pixiText.position.y = text.coordinates.y;
                pixiText.resolution = 2;
                pixiText.zIndex = 1000000; // Always on top
                this._isActiveTexts.set(text.id, pixiText);
                this._stage.addChild(pixiText);
            }
        }
    }

    private cleanUpInactiveActors(): void {
        // Remove any sprites whose associated actors no longer exist.
        this._isActiveSprites.forEach((spriteDetail: SpriteDetail, actorId: string) => {
            // Check if there exists an actor with id == actorId.
            if (!this._world.actors.find(actor => { return actor.id === actorId })) {
                this._stage.removeChild(spriteDetail.sprite);
                this._isActiveSprites.delete(actorId);
            }
        });
    }

    private cleanUpInactiveText() {
        // Remove any text were the associated text items no longer exist.
        this._isActiveTexts.forEach((text: PIXI.Text, textId: string) => {
            // Check if there exists a text with id == textId.
            if (!this._world.texts.find(t => { return t.id === textId })) {
                this._stage.removeChild(text);
                this._isActiveTexts.delete(textId);
            }
        });
    }

    private sortSpritesByActorZOrder() {
        // Sort sprites so that they get rendered in the z-order that's been specified by each actor.
        sortBy(this._stage.children, child => {
            child.zIndex = child.zIndex || 0;
            return child.zIndex;
        });
    }
}
