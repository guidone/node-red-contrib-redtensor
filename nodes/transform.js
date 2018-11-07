const _ = require('underscore');

function determineMeanAndStddev(data) {
  const dataMean = data.mean(0);
  // TODO(bileschi): Simplify when and if tf.var / tf.std added to the API.
  const diffFromMean = data.sub(dataMean);
  const squaredDiffFromMean = diffFromMean.square();
  const variance = squaredDiffFromMean.mean(0);
  const dataStd = variance.sqrt();
  return {dataMean, dataStd};
}

function normalizeTensor(data, dataMean, dataStd) {
  return data.sub(dataMean).div(dataStd);
}

module.exports = function(RED) {
  function RedTensorTransform(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on('input', function(msg) {

      const trainTensor = msg.tensorX;
      const targetTensor = msg.tensorY;

      console.log('TRANSFORM NODE');
      let { dataMean, dataStd } = determineMeanAndStddev(trainTensor);


      dataMean.print();
      dataStd.print();

      msg.tensorX = normalizeTensor(trainTensor, dataMean, dataStd);
      msg.tensorX.print();

      node.send(msg);


    });
  }

  RED.nodes.registerType('redtensor-transform', RedTensorTransform);
};
