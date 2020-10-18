function ActorStubBuilder() {
    this._acceptsDamage = true;
}

ActorStubBuilder.prototype.build = function() {
    var self = this;

    var actorStub = {
        getCollisionMask: function() { return self._collisionMask; },
        getCoordinates: function() { return self._coordinates; },
        getDamageAgainst: function() { return self._damage; },
        getSustainedDamage: function() { return self._sustainedDamage; },
        hitBy: function(actor, damage) { self._sustainedDamage = damage; return self._acceptsDamage; }
    };

    return actorStub;
};

ActorStubBuilder.prototype.declinesDamage = function() {
    this._acceptsDamage = false;
    return this;
};

ActorStubBuilder.prototype.inflictsDamage = function(damage) {
    this._damage = damage;
    return this;
};

ActorStubBuilder.prototype.withCollisionMask = function(left, right, top, bottom) {
    this._collisionMask = [{ left: left, right: right, top: top, bottom: bottom }];
    return this;
};

ActorStubBuilder.prototype.withCoordinates = function(x, y) {
    this._coordinates = { x: x, y: y };
    return this;
};

module.exports = ActorStubBuilder;
