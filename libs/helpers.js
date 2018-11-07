const _ = require('underscore');

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const helper = {

  isModel: model => _.isObject(model) && _.isFunction(model.predict),
  isTensor: tensor => tensor instanceof tf.Tensor,
  isOptimizer: optimizer => optimizer instanceof tf.Optimizer,

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
    }
    if (validator == null) {
      return null;
    }

    if (options.usePayload && msg != null && validator(msg.payload)) {
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
