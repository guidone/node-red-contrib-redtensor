const _ = require('underscore');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

module.exports = function(RED) {
  function RedTensorLayerDense(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.units = parseInt(config.units, 10);
    node.inputDim = parseInt(config.inputDim, 10);
    node.kernelInitializer = !_.isEmpty(config.kernelInitializer) ? config.kernelInitializer : undefined;
    node.activation = !_.isEmpty(config.activation) ? config.activation : undefined;


    this.on('input', function(msg) {

      // todo check if payload is model
      const model = msg.payload;
      const params = {
        units: !isNaN(node.units) ? node.units : undefined,
        inputShape: !isNaN(node.inputDim) ? [node.inputDim] : undefined,
        activation: node.activation,
        kernelInitializer: node.kernelInitializer
      };

      console.log('DENSE LAYER', params);

      model.add(tf.layers.dense(params));

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-layer-dense', RedTensorLayerDense);
};
