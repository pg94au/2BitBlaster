var ScoreCounter = require('../../src/ScoreCounter').ScoreCounter;
var World = require('../../src/World');

function WorldStubBuilder() {
    this._width = 480;
    this._height = 640;
}

WorldStubBuilder.prototype.returningActiveEnemies = function(activeEnemies) {
    this._activeEnemies = activeEnemies;

    return this;
};

WorldStubBuilder.prototype.build = function() {
    var self = this;

    var scoreCounter = new ScoreCounter();
    var world = new World(this._width, this._height, scoreCounter);

    if (this._activeEnemies) {
        world.getActiveEnemies = function() {
            return self._activeEnemies;
        };
    }

    return world;
};

module.exports = WorldStubBuilder;
