function AudioPlayerStubBuilder() {
    this._playedSounds = [];
}

AudioPlayerStubBuilder.prototype.build = function() {
    var self = this;

    var audioPlayerStub = {
        play: function(soundName) { self._playedSounds.push(soundName); },
        getPlayedSounds: function() { return self._playedSounds; }
    };

    return audioPlayerStub;
};

module.exports = AudioPlayerStubBuilder;
