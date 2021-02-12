const { Schema, model } = require('mongoose');

const schema = new Schema({
  apiKey: {
    type: String,
    required: true
  },

  webhookUrl: {
    type: String,
    required: true
  },

  statuses: {
    type: Array,
    required: true
  },

  active: {
    type: Boolean,
    required: true,
    default: true
  },

  orders: Array
});

module.exports = model('Account', schema);
