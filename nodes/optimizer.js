const _ = require('underscore');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');



module.exports = function(RED) {
  function RedTensorOptimizer(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.optimizerType = config.optimizerType;
    node.learningRate = parseFloat(config.learningRate);

    this.on('input', function(msg) {

      const model = tf.sequential();
      let optimizer;

      switch(node.optimizerType) {
        case 'sgd':
          optimizer = tf.train.sgd(node.learningRate);
          break;
      }
      // todo implement momentum, adagrad, adadelta, adam, adamax, rmsprop

      msg.payload = optimizer;
      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-optimizer', RedTensorOptimizer);
};
