"use strict";

var _ = require('underscore');
var debug = require('debug')('Blaster:Renderer');
var Pixi = require('pixi.js');
var Point = require('../Point').Point;

var Renderer = function(containerElement) {
    this._containerElement = containerElement;
    this._activeSprites = {};
    this._activeTexts = {};
    this._preloadedImages = {};
};

Renderer.prototype.preLoadImages = function(images, onLoaded) {
    var self = this;
    var loader = PIXI.loader;
    images.forEach(function(image) {
        loader.add(image.name, image.url);
        self._preloadedImages[image.name] = image.url;
    });
    loader.once('complete', onLoaded);
    loader.load();
};

Renderer.prototype.initialize = function(world) {
    this._world = world;
    this._worldDimensions = this._world.getDimensions();
    this._renderer = Pixi.autoDetectRenderer(this._worldDimensions.width, this._worldDimensions.height);
    this._renderer.backgroundColor = 0x000000;
    this._containerElement.appendChild(this._renderer.view);
    this._stage = new Pixi.Container();
    this._renderer.render(this._stage);
};

Renderer.prototype.destroy = function() {
    while (this._containerElement.firstChild) {
        this._containerElement.removeChild(this._containerElement.firstChild);
    }
};

Renderer.prototype.destroyTextures = function() {
    // TODO: Call this method if necessary when navigating from this page.
    Object.keys(PIXI.utils.TextureCache).forEach(function(texture) {
        PIXI.utils.TextureCache[texture].destroy(true);
    });
};

Renderer.prototype.render = function() {
    this.setScale();

    this.addAnyUnrenderedNewSpritesToStage();

    this.addAnyUnrenderedNewTextToStage();

    this.cleanUpInactiveActors();

    this.cleanUpInactiveText();

    this.sortSpritesByActorZOrder();

    this._renderer.render(this._stage);
};

Renderer.prototype.setScale = function() {
    var height = this._containerElement.clientHeight;
    var width = this._containerElement.clientWidth;

    var scale = height / this._worldDimensions.height;

    this._stage.scale.x = scale;
    this._stage.scale.y = scale;

    this._renderer.resize(width, height);
};

Renderer.prototype.addAnyUnrenderedNewSpritesToStage = function() {
    var self = this;

    var actors = this._world.getActors();
    for (var i=0; i < actors.length; i++) {
        var actor = actors[i];
        var imageDetails = actor.getImageDetails();

        debug('An actor with id ' + actor.getId() + ' and image name ' + imageDetails.name +
            ' is at position ' + JSON.stringify(actor.getCoordinates()));

        var actorSprite = self._activeSprites[actor.getId()];
        // Remove an existing sprite if the image does not match the one requested by the actor.
        if (actorSprite && (actorSprite.imageName !== imageDetails.name)) {
            self._stage.removeChild(self._activeSprites[actor.getId()]);
            delete self._activeSprites[actor.getId()];
            actorSprite = null;
        }
        // Add a new sprite for this actor if one does not already exist.
        if (actorSprite == null) {
            // Create new sprite for this actor, remember it, and add it to the stage.
            var spriteSheetTexture;
            try {
                spriteSheetTexture = PIXI.Texture.fromImage(self._preloadedImages[imageDetails.name]);
            }
            catch (e) {
                throw new Error('Image [' + imageDetails.name + '] has not been pre-loaded.');
            }
            var actorSprite = new PIXI.Sprite(spriteSheetTexture);
            actorSprite.zIndex = actor.getZIndex();
            actorSprite.id = actor.getId();
            actorSprite.imageName = imageDetails.name;
            actorSprite.frames = [];
            for (var index = 0; index < imageDetails.numberOfFrames; index++) {
                actorSprite.frames.push(
                    new PIXI.Texture(
                        spriteSheetTexture,
                        new PIXI.Rectangle(index * imageDetails.frameWidth, 0, imageDetails.frameWidth, spriteSheetTexture.height)
                    )
                );
            }
            actorSprite.anchor.x = 0.5;
            actorSprite.anchor.y = 0.5;
            self._activeSprites[actor.getId()] = actorSprite;
            self._stage.addChild(actorSprite);
        }

        // Move the sprite for this actor to its current position.
        //actorSprite = self._activeSprites[actor.getId()];
        var actorCoordinates = actor.getCoordinates();
        actorSprite.position.x = actorCoordinates.x;
        actorSprite.position.y = actorCoordinates.y;

        // Set the current sprite frame.
        if (actorSprite.frames[imageDetails.currentFrame]) {
            actorSprite.texture = actorSprite.frames[imageDetails.currentFrame];
        }
        else {
            throw new Error('Frame number ' + imageDetails.currentFrame + ' is not valid for image ' + imageDetails.name + '.');
        }
    }
};

Renderer.prototype.addAnyUnrenderedNewTextToStage = function() {
    var self = this;

    // Add any text that hasn't yet been rendered.
    this._world.getTexts().forEach(function(text) {
        var pixiText = self._activeTexts[text.id];
        if (pixiText == null) {
            pixiText = new PIXI.Text(text.content, {font: text.font, fill: text.color});
            pixiText.anchor.x = 0.5;
            pixiText.anchor.y = 0.5;
            var textCoordinates = text.coordinates;
            pixiText.position.x = textCoordinates.x;
            pixiText.position.y = textCoordinates.y;
            pixiText.zIndex = 1000000; // Always on top
            self._activeTexts[text.id] = pixiText;
            self._stage.addChild(pixiText);
        }
    });
};

Renderer.prototype.cleanUpInactiveActors = function() {
    var self = this;

    // Remove any sprites whose associated actors no longer exist.
    for (var actorId in self._activeSprites) {
        if (self._activeSprites.hasOwnProperty(actorId)) {
            // Check if there exists an actor with id == actorId.
            if (!_.find(self._world.getActors(), function(actor) { return actor.getId() == actorId })) {
                self._stage.removeChild(self._activeSprites[actorId]);
                delete self._activeSprites[actorId];
            }
        }
    }
};

Renderer.prototype.cleanUpInactiveText = function() {
    var self = this;

    // Remove any text were the associated text items no longer exist.
    for (var textId in self._activeTexts) {
        if (self._activeTexts.hasOwnProperty(textId)) {
            // Check if there exists a text with id == textId.
            if (!_.find(self._world.getTexts(), function(textItem) { return textItem.id == textId })) {
                self._stage.removeChild(self._activeTexts[textId]);
                delete self._activeTexts[textId];
            }
        }
    }
};

Renderer.prototype.sortSpritesByActorZOrder = function() {
    // Sort sprites so that they get rendered in the z-order that's been specified by each actor.
    _.sortBy(this._stage.children, function(child) {
        child.zIndex = child.zIndex || 0;
        return child.zIndex;
    });
};

module.exports = Renderer;
