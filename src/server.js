const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./api');

const app = express();

app.use(bodyParser.json())
  .use('/', apiRoutes)
  .get('*', (_, res) => (
    res.status(404)
      .send('Endpoint not found.')
  ));

class Server {
  static start (port) {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

module.exports = Server;
