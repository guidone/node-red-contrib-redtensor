const _ = require('underscore');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

/*
  API SDK
  https://js.tensorflow.org/api/0.13.3/#Models-Classes

  Implementing
  https://js.tensorflow.org/

  Examples
  https://github.com/aymericdamien/TensorFlow-Examples

  Tutorials
  https://www.tensorflow.org/tutorials/

  Example Boston Housing
  https://github.com/tensorflow/tfjs-examples/blob/master/boston-housing/data.js

  Example Iris classification problem
  https://www.tensorflow.org/tutorials/eager/custom_training_walkthrough

  Dashboard charts
  https://github.com/node-red/node-red-dashboard/blob/master/Charts.md

  Overfitting
  https://www.tensorflow.org/tutorials/keras/overfit_and_underfit

*/

module.exports = function(RED) {
  function RedTensorModel(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.modelType = config.modelType;

    this.on('input', function(msg) {

      let model;
      switch(node.modelType) {
        case 'model':
          model = tf.model();
          break;
        case 'sequential':
          model = tf.sequential();
          break;
      }

      msg.payload = model;
      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-model', RedTensorModel);
};
