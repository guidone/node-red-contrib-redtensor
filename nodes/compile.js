const _ = require('underscore');


module.exports = function(RED) {
  function RedTensorCompile(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.on('input', function(msg) {

      // todo check if payload is model
      const model = msg.payload;


      // todo loss should be another node
      // todo optimizer should be another node
      model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});


      console.log('compiled');

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-compile', RedTensorCompile);
};
