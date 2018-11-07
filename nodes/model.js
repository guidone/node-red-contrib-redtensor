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

  Dashboard charts
  https://github.com/node-red/node-red-dashboard/blob/master/Charts.md

*/

module.exports = function(RED) {
  function RedTensorModel(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.on('input', function(msg) {

      // todo implement different type of model
      const model = tf.sequential();


      msg.payload = model;
      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-model', RedTensorModel);
};
