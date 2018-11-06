const _ = require('underscore');

const isModel = require('../libs/helpers').isModel;
const isOptimizer = require('../libs/helpers').isOptimizer;
const extractValue = require('../libs/helpers').extractValue;

module.exports = function(RED) {
  function RedTensorCompile(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.debug = config.debug;

    node.status({ fill: 'red', shape: 'ring', text: 'Missing Model, Optimizer' });

    this.on('input', function(msg) {

      let model, optimizer;

      model = extractValue('model', 'model', msg, node, { store: true });
      optimizer = extractValue('optimizer', 'optimizer', msg, node, { store: true });

      // check what's missing
      let missingElements = [];
      if (!isModel(model)) {
        missingElements.push('Model');
      }
      if (!isOptimizer(optimizer)) {
        missingElements.push('Optimizer');
      }

      if (_.isEmpty(missingElements)) {
        node.status({fill: 'green', shape: 'ring', text: 'All set'});

        // todo loss should be another node
        model.compile({
          loss: 'meanSquaredError',
          optimizer: optimizer
          //optimizer: 'sgd'
        });
        msg.payload = model;

        if (node.debug) {
          console.log(model.summary());
        }

        node.send(msg);
      }

    });
  }

  RED.nodes.registerType('redtensor-compile', RedTensorCompile);
};
