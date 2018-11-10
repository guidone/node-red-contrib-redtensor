const _ = require('underscore');
const isTensor = require('../libs/helpers').isTensor;
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const cloneArray = require('../libs/helpers').cloneArray;

function shuffle(data, target) {
  let counter = data.length;
  let temp = 0;
  let index = 0;
  while (counter > 0) {
    index = (Math.random() * counter) | 0;
    counter--;
    // data:
    temp = data[counter];
    data[counter] = data[index];
    data[index] = temp;
    // target:
    temp = target[counter];
    target[counter] = target[index];
    target[index] = temp;
  }
};

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
    node.transformation = config.transformation;
    node.target = config.target;

    this.on('input', function(msg) {

      let target, transformed;
      let storeIn = node.target;
      if (node.target === 'payload' && isTensor(msg.payload)) {
        target = msg.payload;
      } else if (node.target === 'tensorX' && isTensor(msg.tensorX)) {
        target = msg.tensorX;
      } else if (node.target === 'tensorY' && isTensor(msg.tensorY)) {
        target = msg.tensorY;
      }

      console.log('TRANSFORM NODE');
      switch(node.transformation) {
        case 'normalize':
          let { dataMean, dataStd } = determineMeanAndStddev(target);
          dataMean.print();
          dataStd.print();

          transformed = normalizeTensor(target, dataMean, dataStd);
          transformed.print();
          break;
        case 'identity':
          // do nothing
          break;
        case 'shuffle2':
          storeIn = null; // do not store
          const trainTensor = msg.tensorX;
          const targetTensor = msg.tensorY;

          const trainSize = trainTensor.shape[0];
          const newOrder = [];
          for(var idx = 0; idx < trainSize; idx++) {
            newOrder.push(idx);
          }
          const tensorOrder = tf.tensor1d(_.shuffle(newOrder), 'int32');

          //console.log('shuffleeeeee');
          //console.log('newOrder', newOrder);
          //tensorOrder.print();

          msg.tensorX = trainTensor.gather(tensorOrder);
          msg.tensorY = targetTensor.gather(tensorOrder);

          console.log('media dopo');
          break;

        // similar but doesn't really change
        case 'shuffle':

          const trainData = cloneArray(msg.trainData);
          const targetData = cloneArray(msg.targetData);

          console.log('TrainData', trainData);
          console.log('TrainData', targetData);

          storeIn = null;
          shuffle(trainData, targetData);

          msg.tensorX = tf.tensor2d(trainData);
          console.log('done x');
          msg.tensorY = tf.tensor2d(targetData);

          console.log('tensor x');
          msg.tensorX.print();

          console.log('tensor y');
          msg.tensorY.print();



          //console.log('riordinato-----');
          //msg.tensorX.print();


          break;
      }

      if (storeIn === 'payload' && isTensor(msg.payload)) {
        msg.payload = transformed;
      } else if (storeIn === 'tensorX' && isTensor(msg.tensorX)) {
         msg.tensorX = transformed;
      } else if (storeIn === 'tensorY' && isTensor(msg.tensorY)) {
        msg.tensorY = transformed;
      } else {
        console.log('not stored');
      }

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-transform', RedTensorTransform);
};
