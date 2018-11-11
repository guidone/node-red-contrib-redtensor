const _ = require('underscore');
const Helpers = require('../libs/helpers');
const { isModel, isOptimizer, isLoss, extractValue } = Helpers;

module.exports = function(RED) {
  function RedTensorCompile(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.debug = config.debug;
    node.optimizer = config.optimizer;
    node.loss = config.loss;

    // evaluate the missing elements at startup
    let missingElements = ['Model'];
    if (!isOptimizer(node.optimizer)) {
      missingElements.push('Optimizer');
    }
    if (!isLoss(node.loss)) {
      missingElements.push('Loss');
    }
    node.status({ fill: 'red', shape: 'ring', text: `Missing ${missingElements.join(', ')}` });

    this.on('input', function(msg) {

      let model, optimizer, loss;

      model = extractValue('model', 'model', msg, node, { store: true });
      optimizer = extractValue('optimizer', 'optimizer', msg, node, { store: true });
      loss = extractValue('loss', 'loss', msg, node, { store: true });

      // check what's missing
      let missingElements = [];
      if (!isModel(model)) {
        missingElements.push('Model');
      }
      if (!isOptimizer(optimizer)) {
        missingElements.push('Optimizer');
      }
      if (!isLoss(loss)) {
        missingElements.push('Loss');
      }

      if (_.isEmpty(missingElements)) {
        node.status({fill: 'green', shape: 'ring', text: 'All set'});

        model.compile({
          loss: loss,
          optimizer: optimizer
        });
        msg.payload = model;

        if (node.debug) {
          model.summary();
        }

        node.send(msg);
      }
    });
  }

  RED.nodes.registerType('redtensor-compile', RedTensorCompile);
};
