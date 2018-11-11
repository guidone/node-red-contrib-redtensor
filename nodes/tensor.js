const _ = require('underscore');
const tf = require('@tensorflow/tfjs');
const Helpers = require('../libs/helpers');
require('@tensorflow/tfjs-node');

const { cloneArray } = Helpers;

module.exports = function(RED) {
  function RedTensorTensor(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.tensorType = config.tensorType;
    node.tensorInput = config.tensorInput;
    node.dim1 = config.dim1;
    node.dim2 = config.dim2;
    node.dim3 = config.dim3;
    node.dim4 = config.dim4;
    node.dim5 = config.dim5;
    node.dim6 = config.dim6;
    node.debug = config.debug;

    // todo validation of the shape


    this.on('input', function(msg) {

      let data;
      if (_.isArray(msg.payload)) {
        // this is magic
        data = cloneArray(msg.payload);
      }

      // exit if data is null
      if (data == null) {
        return;
      }

      // calculate shape
      let shape = undefined;
      if (node.tensorType !== 'tensor1d') {
        let toDim = null;
        shape = [];
        switch(this.tensorType) {
          case 'tensor':
          case 'tensor6d':
            toDim = 6;
            break;
          case 'tensor5d':
            toDim = 5;
            break;
          case 'tensor4d':
            toDim = 4;
            break;
          case 'tensor3d':
            toDim = 3;
            break;
          case 'tensor2d':
            toDim = 2;
            break;
          case 'tensor1d':
            toDim = null;
        }
        for(let i = 1; i <= toDim; i++) {
          shape.push(parseInt(node['dim' + i], 10));
        }
        // void if an is NaN
        if (_(shape).any(value => isNaN(value))) {
          shape = null;
        }
      }




      //data = [ [ 1 ], [ 2 ], [ 3 ], [ 4 ] ];

      //console.log('---', msg.payload);
      //console.log('initializing with ', data, _.isArray(data), data.length, data[0], data[1], data[2], data[3]);
      //console.log('shape', shape);

      let tensor;


      // todo add the type
      if (node.tensorType === 'tensor1d') {
        tensor = tf.tensor1d(data); // different signature
      } else {
        tensor = tf[node.tensorType](data, shape);
      }
      // debug
      if (node.debug && tensor != null) {
        tensor.print();
      }
      // assign to input or output
      if (node.tensorInput != null) {
        msg[node.tensorInput] = tensor;
      }

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-tensor', RedTensorTensor);
};
