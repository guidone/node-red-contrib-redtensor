const _ = require('underscore');

module.exports = function(RED) {
  function RedTensorDump(config) {
    RED.nodes.createNode(this, config);

    this.on('input', function(msg) {
      if (msg.payload != null && _.isFunction(msg.payload.print)) {
        console.log(msg.payload.print());
      }
    });
  }

  RED.nodes.registerType('redtensor-dump', RedTensorDump);
};
