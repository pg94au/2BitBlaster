function ClockStubBuilder() {}

ClockStubBuilder.prototype.build = function() {
    var self = this;

    var clockStub = {
        addSeconds: function(seconds) {
            this._currentDate.setSeconds(this._currentDate.getSeconds() + seconds);
        },
        getCurrentDate: function() { return new Date(this._currentDate.getTime()); },
        setCurrentDate: function(currentDate) { this._currentDate = currentDate; }
    };
    clockStub._currentDate = new Date();

    return clockStub;
};

module.exports = ClockStubBuilder;
