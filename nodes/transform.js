const _ = require('underscore');
const Helpers = require('../libs/helpers');
const { isTensor, decodeTarget } = Helpers;
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
}

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
      const disabledTarget = ['shuffle'];

      if (node.target === 'payload' && isTensor(msg.payload)) {
        target = msg.payload;
      } else if (node.target != null && isTensor(msg[node.target])) {
        target = msg[node.target];
      }

      // if a tranformation is selected and it's not one of those that disable the target menu, then check
      // for a valid tensor in "target"
      if (node.transformation != null && disabledTarget.indexOf(node.transformation) === -1) {
        if (!isTensor(target)) {
          node.error(`${decodeTarget(node.target)} tensor is missing or invalid.`);
        }
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
        case 'shuffle':
          storeIn = null; // do not store
          const trainTensor = msg.trainFeatures;
          const targetTensor = msg.trainTarget;

          if (!isTensor(trainTensor)) {
            node.error('Train features tensor is missing or invalid.');
            return;
          }
          if (!isTensor(targetTensor)) {
            node.error('Train target tensor is missing or invalid.');
            return;
          }

          const trainSize = trainTensor.shape[0];
          const newOrder = [];
          for(let idx = 0; idx < trainSize; idx++) {
            newOrder.push(idx);
          }
          const tensorOrder = tf.tensor1d(_.shuffle(newOrder), 'int32');


          msg.trainFeatures = trainTensor.gather(tensorOrder);
          msg.trainTarget = targetTensor.gather(tensorOrder);

          console.log('media dopo');
          break;

        // similar but doesn't really change
        case 'shuffle2':

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



          break;
      }

      if (storeIn === 'payload') {
        msg.payload = transformed;
      } else if (storeIn != null) {
         msg[storeIn] = transformed;
      }

      node.send(msg);
    });
  }

  RED.nodes.registerType('redtensor-transform', RedTensorTransform);
};
