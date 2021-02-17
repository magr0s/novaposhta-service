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

  clearStatuses: {
    type: Array,
    required: true
  },

  stopDate: {
    type: Date,
    default: null
  },

  documentsCache: Object
});

module.exports = model('Account', schema);
