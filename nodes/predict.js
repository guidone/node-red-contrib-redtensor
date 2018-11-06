const _ = require('underscore');
const extractValue = require('../libs/helpers').extractValue;

module.exports = function(RED) {
  function RedTensorPredict(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.status({ fill: 'red', shape: 'ring', text: 'Missing Model' });

    this.on('input', function(msg) {
      let model, tensor;

      model = extractValue('model', 'model', msg, node, { store: true });
      tensor = extractValue('tensor', 'tensor', msg, node, { store: false });

      if (model != null) {
        node.status({ fill: 'green', shape: 'ring', text: 'All set' });
      }

      if (tensor != null) {
        console.log('predicinting');

        const result = model.predict(tensor);

        // todo add debug node
        //console.log(result.print());

        msg.payload = result;
        node.send(msg);
      }



    });
  }

  RED.nodes.registerType('redtensor-predict', RedTensorPredict);
};
