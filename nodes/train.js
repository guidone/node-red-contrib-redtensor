const _ = require('underscore');
const Helpers = require('../libs/helpers');
const { isModel, isTensor } = Helpers;
const extractValue = Helpers.extractValue;





module.exports = function(RED) {

  function onEpochEnd(node, msg) {

    return function(epoch, logs) {

      node.status({fill: 'yellow', shape: 'ring', text: `Training... ${epoch}/${node.epochs}`});
      const context = node.context();
      const epochs = node.epochs;
      // setup data message
      const dataMessage = RED.util.cloneMessage(msg);
      dataMessage.payload = { epoch, logs };
      // prepare chart messages
      const chartMessage = RED.util.cloneMessage(msg);
      const entityToShow = ['loss'];
      const labels = ['Loss'];
      const chartValues = [];
      // dinamically set other entities
      if (logs.val_loss != null) {
        entityToShow.push('val_loss');
        labels.push('Validation loss');
      }
      // prepare x labels
      const xAxisLabels = [];
      for (var i = 1; i <= epochs; i++) {
        xAxisLabels.push(`Epoch ${i}`);
      }
      // cycle over all entities to show loss and ...
      entityToShow.forEach(valueName => {
        let data = context.get(valueName);
        if (data == null) {
          data = [];
        }
        data.push(logs[valueName]);
        context.set(valueName, data);
        chartValues.push(data);
      });
      // finally setup message for the dashboard ui chart
      chartMessage.payload = [{
        series: labels,
        data: chartValues,
        labels: xAxisLabels
      }];

      node.send([null, dataMessage, chartMessage]);
    };
  }


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
      const context = node.context();

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
        // update status
        node.status({ fill: 'yellow', shape: 'ring', text: `Training... 1/${node.epochs}` });
        // prepare fit params
        const params = {
          epochs: node.epochs,
          verbose: _.isNumber(node.verbose) ? node.verbose : undefined,
          batchSize: _.isNumber(node.batchSize) ? node.batchSize : undefined,
          validationSplit: _.isNumber(node.validationSplit) ? node.validationSplit : undefined,
          callbacks: {
            onEpochEnd: onEpochEnd(node, msg)
          }
        };
        //console.log('Train params', _(params).omit('callbacks'));

        // send a reset to the chart, and reset alla stored series
        node.send([null, null, { ...msg, payload: [] }]);
        context.set('loss', null);
        context.set('val_loss', null);

        model
          .fit(trainFeatures, trainTarget, params)
          .then(() => {

            // show status in UI
            node.status({ fill: 'green', shape: 'ring', text: 'All set' });
            // prepare payload
            const context = node.context();
            context.set('model', null);
            // todo why all?
            context.set('trainFeatures', null);
            context.set('trainTarget', null);
            msg.payload = model;
            node.send([msg, null, null]);
          });
      } else {
        node.status({ fill: 'red', shape: 'ring', text: `Missing ${missingElements.join(', ')}` });
      }
    });
  }

  RED.nodes.registerType('redtensor-train', RedTensorTrain);
};
