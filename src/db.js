const mongoose = require('mongoose');

class DB {
  static async init (url) {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}

module.exports = DB;
