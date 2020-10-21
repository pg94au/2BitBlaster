var debug = require('debug')('Blaster:ScoreCounter');
var events = require('events');
var superagent = require('superagent');

function ScoreCounter() {
    debug('ScoreCounter constructor');
    this._eventEmitter = new events.EventEmitter();
    this._currentScore = 0;
    this._highScore = 0;
    this.synchronizeHighScore();
}

ScoreCounter.prototype.getCurrentScore = function() {
    return this._currentScore;
};

ScoreCounter.prototype.increment = function(amount) {
    debug('ScoreCounter.increment');

    this._currentScore += amount;
    this._eventEmitter.emit('score', this._currentScore);

    if (this._currentScore > this._highScore) {
        this._highScore = this._currentScore;
        this._eventEmitter.emit('highScore', this._highScore);
    }
};

ScoreCounter.prototype.synchronizeHighScore = function() {
    var self = this;

    var remoteHighScore;
    superagent.get('highScore').end(
        function(error, result) {
            if (error || !result.ok) {
                debug('Unable to retrieve high score from server.');
                remoteHighScore = 0;
            }
            else {
                remoteHighScore = parseInt(result.text);
            }

            if (self._highScore > remoteHighScore) {
                superagent.put('highScore')
                    .set('Content-Type', 'text/plain')
                    .send(self._highScore)
                    .end(
                        function(error, result) {
                            if (error || !result.ok) {
                                debug('Failed to submit high score to server.');
                            }
                        }
                    );
            }
            else {
                self._highScore = remoteHighScore;
            }

            self._eventEmitter.emit('highScore', self._highScore);
        }
    );
};

ScoreCounter.prototype.on = function(e, f) {
    debug('ScoreCounter.on');
    this._eventEmitter.on(e, f);

    switch(e) {
        case 'score':
            this._eventEmitter.emit('score', this._currentScore);
            break;
        case 'highScore':
            this._eventEmitter.emit('highScore', this._highScore);
            break;
    }
};

module.exports = ScoreCounter;