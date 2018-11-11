const _ = require('underscore');
const Helpers = require('../libs/helpers');
const { isModel, isTensor } = Helpers;
const extractValue = Helpers.extractValue;

module.exports = function(RED) {
  function RedTensorTrain(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.debug = config.debug;
    node.epochs = !isNaN(parseInt(config.epochs, 10)) ? parseInt(config.epochs, 10) : null;
    node.verbose = !isNaN(parseInt(config.verbose, 10)) ? parseInt(config.verbose, 10) : 1;
    node.batchSize = !isNaN(parseInt(config.batchSize, 10)) ? parseInt(config.batchSize, 10) : null;
    node.validationSplit = !isNaN(parseFloat(config.validationSplit)) ? parseFloat(config.validationSplit) : null;

    node.status({ fill: 'red', shape: 'ring', text: 'Missing Model, Train Features, Train Target' });

    this.on('close', function() {
      console.log('closing train node');

    });

    this.on('input', function(msg) {
      let model, trainFeatures, trainTarget;

      model = extractValue('model', 'model', msg, node, { store: true });
      trainFeatures = extractValue('tensor', 'trainFeatures', msg, node, { usePayload: false, store: true });
      trainTarget = extractValue('tensor', 'trainTarget', msg, node, { usePayload: false, store: true });

      // check what's missing
      let missingElements = [];
      if (!isModel(model)) {
        missingElements.push('Model');
      }
      if (!isTensor(trainFeatures)) {
        missingElements.push('Train features');
      }
      if (!isTensor(trainTarget)) {
        missingElements.push('Train Target');
      }

      if (_.isEmpty(missingElements)) {
        node.status({ fill: 'yellow', shape: 'ring', text: `Training... 0/${node.epochs}` });


        const params = {
          epochs: node.epochs,
          verbose: _.isNumber(node.verbose) ? node.verbose : undefined,
          batchSize: _.isNumber(node.batchSize) ? node.batchSize : undefined,
          validationSplit: _.isNumber(node.validationSplit) ? node.validationSplit : undefined,
        };

        console.log('Train params', params);

        // set callbacks
        params.callbacks = {
          onEpochEnd: (epoch, logs) => {
            node.status({ fill: 'yellow', shape: 'ring', text: `Training... ${epoch}/${node.epochs}` });
            msg.payload = { epoch, logs };
            node.send([null, msg]);
          }
        };
        model
          .fit(trainFeatures, trainTarget, params)
          .then(() => {
            // debug
            //if (node.debug && model != null) {
            //  model.summary(160);
            //}
            // show status in UI
            node.status({ fill: 'green', shape: 'ring', text: 'All set' });
            // prepare payload
            const context = node.context();
            context.set('model', null);
            context.set('trainFeatures', null);
            context.set('trainTarget', null);
            msg.payload = model;
            node.send([msg, null]);
          });
      } else {
        node.status({ fill: 'red', shape: 'ring', text: `Missing ${missingElements.join(', ')}` });
        // debug
        //if (node.debug && model != null) {
        //  model.summary(160);
        //}
        // do nothing
      }
    });
  }

  RED.nodes.registerType('redtensor-train', RedTensorTrain);
};
