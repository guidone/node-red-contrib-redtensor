const _ = require('underscore');
const isModel = require('../libs/helpers').isModel;
const isTensor = require('../libs/helpers').isTensor;
const extractValue = require('../libs/helpers').extractValue;

module.exports = function(RED) {
  function RedTensorTrain(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.debug = config.debug;
    node.epochs = !isNaN(parseInt(config.epochs, 10)) ? parseInt(config.epochs, 10) : null;
    node.verbose = !isNaN(parseInt(config.verbose, 10)) ? parseInt(config.verbose, 10) : 1;
    node.batchSize = !isNaN(parseInt(config.batchSize, 10)) ? parseInt(config.batchSize, 10) : null;
    node.validationSplit = !isNaN(parseFloat(config.validationSplit)) ? parseFloat(config.validationSplit) : null;

    node.status({ fill: 'red', shape: 'ring', text: 'Missing Model, Tensor X, Tensor Y' });

    this.on('close', function() {
      console.log('closing train node');

    });

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
        node.status({ fill: 'yellow', shape: 'ring', text: `Training... 0/${node.epochs}` });


        const params = {
          epochs: node.epochs,
          //epochs: 200,
          //batchSize: 40,
          //validationSplit: 0.2,
          verbose: _.isNumber(node.verbose) ? node.verbose : undefined,
          //verbose: 2,
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
          .fit(tensorX, tensorY, params)
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
            context.set('tensorX', null);
            context.set('tensorY', null);
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
