const _ = require('underscore');
const isModel = require('../libs/helpers').isModel;
const isTensor = require('../libs/helpers').isTensor;
const extractValue = require('../libs/helpers').extractValue;



module.exports = function(RED) {
  function RedTensorTrain(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.debug = config.debug;
    node.epoch = config.epoch;

    node.status({ fill: 'red', shape: 'ring', text: 'Missing Model, Tensor X, Tensor Y' });

    this.on('input', function(msg) {


      let model, tensorX, tensorY;

      model = extractValue('model', 'model', msg, node, { store: true });
      tensorX = extractValue('tensor', 'tensorX', msg, node, { usePayload: false, store: true });
      tensorY = extractValue('tensor', 'tensorY', msg, node, { usePayload: false, store: true });

      // check what's missing
      let missingElements = [];
      if (!isModel(model)) {
        missingElements.push('Model');
      }
      if (!isTensor(tensorX)) {
        missingElements.push('Tensor X');
      }
      if (!isTensor(tensorY)) {
        missingElements.push('Tensor Y');
      }

      if (_.isEmpty(missingElements)) {
        node.status({ fill: 'yellow', shape: 'ring', text: 'Training...' });

        model
          .fit(tensorX, tensorY, {
            epochs: node.epoch
          })
          .then(() => {
            // debug
            if (node.debug && model != null) {
              console.log(model.summary(160))
            }
            // show status in UI
            node.status({ fill: 'green', shape: 'ring', text: 'All set' });
            // prepare payload
            msg.payload = model;
            node.send(msg);
          });
      } else {
        node.status({ fill: 'red', shape: 'ring', text: `Missing ${missingElements.join(', ')}` });
        // debug
        if (node.debug && model != null) {
          console.log(model.summary(160))
        }
      }

    });
  }

  RED.nodes.registerType('redtensor-train', RedTensorTrain);
};
