const Account = require('./model');
const AccountService = require('./service');

class AccountController {
  static async cron (_, res) {
    //

    res.end();
  }

  static async add (req, res) {
    const { body = {} } = req;

    const {
      apiKey,
      webhookUrl,
      statuses
    } = body;

    try {
      const account = new Account({
        apiKey,
        webhookUrl,
        statuses: statuses.map(n => n.toString())
      })

      await account.save();

      res.send({ success: true });
    } catch (err) {
      console.log(err);

      res.status(500).send({
        success: false,
        error: err.toString()
      });
    }
  }

  static async start (req, res) {
    const { apiKey } = req.body || {};

    try {
      await Account.updateOne({ apiKey }, { $set: { stopDate: null } });

      res.send({ success: true });
    } catch (err) {
      console.log(err);

      res.status(500).send({
        success: false,
        error: err.toString()
      });
    }
  }

  static async stop (req, res) {
    const { apiKey } = req.body || {};

    try {
      await Account.updateOne({ apiKey }, { $set: { stopDate: Date.now() } });

      res.send({ success: true });
    } catch (err) {
      console.log(err);

      res.status(500).send({
        success: false,
        error: err.toString()
      });
    }
  }

  static async delete (req, res) {
    const { apiKey } = req.body || {};

    try {
      await Account.deleteOne({ apiKey });

      res.send({ success: true });
    } catch (err) {
      console.log(err);

      res.status(500).send({
        success: false,
        error: err.toString()
      });
    }
  }
}

module.exports = AccountController;
