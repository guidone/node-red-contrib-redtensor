const _ = require('underscore');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

module.exports = function(RED) {
  function RedTensorLayerDense(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.units = parseInt(config.units, 10);
    node.inputDim = parseInt(config.inputDim, 10);

    this.on('input', function(msg) {

      // todo check if payload is model
      const model = msg.payload;

      // todo add params units and inputShape
      model.add(tf.layers.dense({units: node.units, inputShape: [node.inputDim]}));

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-layer-dense', RedTensorLayerDense);
};
