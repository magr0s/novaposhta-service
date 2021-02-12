const dotenv = require('dotenv');

const DB = require('./src/db');
const Server = require('./src/server');

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;


(
  async () => {
    try {
      await DB.init(MONGODB_URL);

      console.log(Server)

      Server.start(PORT);
    } catch (err) {
      console.log(err);
    }
  }
)();
