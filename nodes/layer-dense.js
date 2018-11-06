const _ = require('underscore');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

module.exports = function(RED) {
  function RedTensorLayerDense(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.on('input', function(msg) {

      // todo check if payload is model
      const model = msg.payload;

      // todo add params units and inputShape
      model.add(tf.layers.dense({units: 1, inputShape: [1]}));

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-layer-dense', RedTensorLayerDense);
};
