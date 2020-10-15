function RendererStubBuilder() {}

RendererStubBuilder.prototype.build = function() {
    var self = this;

    var rendererStub = {
        initialize: function() {},
        render: function() {}
    };

    return rendererStub;
};

module.exports = RendererStubBuilder;
