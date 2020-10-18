var debug = require('debug')('Blaster:AudioPlayer');
var ResourceLoader = require('resource-loader');

function AudioPlayer() {
    debug('AudioPlayer constructor');

    ResourceLoader.Resource.setExtensionLoadType('mp3', ResourceLoader.Resource.LOAD_TYPE.XHR);
    ResourceLoader.Resource.setExtensionXhrType('mp3', ResourceLoader.Resource.XHR_RESPONSE_TYPE.BUFFER);

    this.decodedAudio = null;

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
}

AudioPlayer.prototype.preLoadSounds = function(sounds, onSuccess, onFailure) {
    var self = this;

    // Use an inner loader here so that we can specify success and failure callbacks
    // per request to pre-load.  They are per ResourceLoader instance otherwise,
    // because of the way event handlers are registered with the instance.
    function LoaderInstance(sounds, onSuccess, onFailure) {
        var instance = this;
        this.resourceLoader = new ResourceLoader();

        this.errors = [];
        this.errorHandler = function(error) {
            debug('Error event while loading audio resources: ' + error);
            instance.errors.push(error);
        };
        this.resourceLoader.on('error', this.errorHandler);

        for (var i = 0; i < sounds.length; i++) {
            this.resourceLoader.add(sounds[i].name, sounds[i].url);
        }

        this.load = function() {
            instance.resourceLoader.load(function(rl, resources) {
                if (instance.errors.length > 0) {
                    onFailure(instance.errors);
                }
                else {
                    debug('Successfully loaded ' + resources.length + ' sounds.');
                    // self.resources = resources;

                    var decodePromises = [];
                    var decodeNames = [];
                    for (var i in resources) {
                        decodePromises.push(self.audioContext.decodeAudioData(resources[i].data));
                        decodeNames.push(resources[i].name);
                    }
                    Promise.all(decodePromises).then(
                        function(decodedAudio) {
                            debug('Decoded ' + decodedAudio.length + ' audio samples.');
                            self.decodedAudio = {};
                            for (var i = 0; i < decodedAudio.length; i++) {
                                self.decodedAudio[decodeNames[i]] = decodedAudio[i];
                            }

                            setTimeout(onSuccess, 0);
                        },
                        function(reason) {
                            debug('Promise.all rejected: ' + reason);
                        }
                    );
                }
            });
        };
    }

    var loaderInstance = new LoaderInstance(sounds, onSuccess, onFailure);
    loaderInstance.load();
};

AudioPlayer.prototype.play = function(soundName) {
    var decodedAudio = this.decodedAudio[soundName];
    if (decodedAudio) {
        debug('Playing sound ' + soundName);

        var source = this.audioContext.createBufferSource();
        source.buffer = this.decodedAudio[soundName];
        source.connect(this.audioContext.destination);
        source.start(0);
    }
    else {
        throw new Error('Cannot find sound ' + soundName);
    }
};

module.exports = AudioPlayer;
