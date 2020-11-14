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
    private _renderer!: PIXI.Renderer;
    private _stage!: PIXI.Container;
    private _activeSprites: Map<string, SpriteDetail> = new Map<string, SpriteDetail>();
    private _activeTexts: Map<string, PIXI.Text> = new Map<string, PIXI.Text>();
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
        let texts = this._world.getTexts();
        for (let text of texts) {
            let pixiText : PIXI.Text | undefined = this._activeTexts.get(text.id);

            // Add a new text if one does not already exist.
            if (!pixiText) {
                pixiText = new PIXI.Text(text.content, {font: text.font, fill: text.color});
                pixiText.scale.x = 2;
                pixiText.scale.y = 2;
                pixiText.anchor.x = 0.5;
                pixiText.anchor.y = 0.5;
                pixiText.position.x = text.coordinates.x;
                pixiText.position.y = text.coordinates.y;
                pixiText.resolution = 2;
                pixiText.zIndex = 1000000; // Always on top
                this._activeTexts.set(text.id, pixiText);
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
        this._activeTexts.forEach((text: PIXI.Text, textId: string) => {
            // Check if there exists a text with id == textId.
            if (!this._world.getTexts().find(text => { return text.id == textId })) {
                this._stage.removeChild(text);
                this._activeTexts.delete(textId);
            }
        });
    }

    sortSpritesByActorZOrder() {
        // Sort sprites so that they get rendered in the z-order that's been specified by each actor.
        sortBy(this._stage.children, child => {
            child.zIndex = child.zIndex || 0;
            return child.zIndex;
        });
    }
}
