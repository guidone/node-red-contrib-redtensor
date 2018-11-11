const _ = require('underscore');

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const optimizers = ['sgd','momentum','adagrad','adadelta','adam','adamax','rmsprop'];
const losses = [
  'absoluteDifference',
  'computeWeightedLoss',
  'cosineDistance',
  'hingeLoss',
  'huberLoss',
  'meanSquaredError',
  'sigmoidCrossEntropy',
  'softmaxCrossEntropy'
];

const helper = {

  isModel: model => _.isObject(model) && _.isFunction(model.predict),
  isTensor: tensor => tensor instanceof tf.Tensor,
  isOptimizer: optimizer => {
    return optimizer instanceof tf.Optimizer || (_.isString(optimizer) && optimizers.indexOf(optimizer) !== -1);
  },
  isLoss: loss => {
    // todo add here loss classes
    return (_.isString(loss) && losses.indexOf(loss) !== -1);
  },

  decodeTarget: target => {
    switch(target) {
      case 'trainFeatures':
        return 'Train Features';
      case 'trainTarget':
        return 'Train Target';
      case 'testFeatures':
        return 'Test Features';
      case 'testTarget':
        return 'Test Target';
      case 'payload':
        return 'Payload';
      default:
        return target;
    }
  },

  /**
   * @method cloneArray
   * Clone array from payload, othwerwise array coming from payload will not work with tensor, don't know why.
   * Also if there's not [...] doesn't work, no sense
   */
  cloneArray: arr => {
    return [...arr.map(item => _.isArray(item) ? helper.cloneArray(item) : item)];
  },

  extractValue: (type, name, msg, node, opts) => {
    const options = _.extend({
      usePayload: true,
      useContext: true,
      store: false
    }, opts);
    let validator;
    switch(type) {
      case 'tensor':
        validator = helper.isTensor;
        break;
      case 'model':
        validator = helper.isModel;
        break;
      case 'optimizer':
        validator = helper.isOptimizer;
        break;
      case 'loss':
        validator = helper.isLoss;
        break;
    }
    if (validator == null) {
      return null;
    }

    if (validator(node[name])) {
      return node[name];
    } else if (options.usePayload && msg != null && validator(msg.payload)) {
      if (options.store) {
        node.context().set(name, msg.payload);
      }
      return msg.payload;
    } else if (msg != null && validator(msg[name])) {
      if (options.store) {
        node.context().set(name, msg[name]);
      }
      return msg[name];
    } else if (msg != null && msg.payload != null && validator(msg.payload[name])) {
      if (options.store) {
        node.context().set(name, msg.payload[name]);
      }
      return msg.payload[name];
    } else if (options.useContext && validator(node.context().get(name))) {
      return node.context().get(name);
    }
    return null;
  }

};

module.exports = helper;
