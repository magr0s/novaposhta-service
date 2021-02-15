const axios = require('axios');
const Account = require('./model');
const NovaposhtaApi = require('../../libs/novaposhta');
const TelegramBot = require('../../libs/telegrambot');

const { default: PQueue } = require('p-queue');

const {
  syncPQueueConfig: SYNC_PQUEUE_CONFIG
} = require('../config');

const pqueue = new PQueue(SYNC_PQUEUE_CONFIG);

class AccountService {
  static async sync () {
    const accounts = await Account.find({ stopDate: null });

    const queue = accounts.map(({
      apiKey,
      webhookUrl: url,
      documentsCache = {},
      statuses = []
    }) =>
      async () => {
        const np = new NovaposhtaApi(apiKey);

        try {
          const list = (
            await np.invoiceDocument.getDocumentList({ GetFullList: 1 })
          )
            .map(({ IntDocNumber: DocumentNumber }) => ({ DocumentNumber }));

          if (!list.length) {
            return ;
          }

          const documents = await np.trackingDocument.getStatusDocuments(list);

          // account has documents cache
          if (
            typeof (documentsCache) === 'object' &&
            Object.keys(documentsCache).length
          ) {
            const promises = documents.reduce((p, data) => {
              const {
                Number: number,
                StatusCode: status
              } = data;

              // find modify status
              if (
                typeof (documentsCache[number] !== 'undefined') &&
                statuses.includes(status) &&
                documentsCache[number] !== status
              ) {
                const request = axios.post(url, data, {
                  headers: { 'Content-Type': 'application/json' }
                })
                  .catch(err => (console.log(err)));

                p.push(request);
              }

              return p;
            }, []);

            await Promise.all(promises);
          }

          const cache = documents.reduce((acc, { Number, StatusCode }) => {
            acc[Number] = acc[Number] = StatusCode;

            return acc;
          }, {});

          await Account.updateOne({ apiKey }, { documentsCache: cache });
        } catch (err) {
          console.log(err);

          await TelegramBot.sendMessage(`[${apiKey}] ${err.toString()}`);
        }
      }
    );

    await pqueue.addAll(queue);
  }
}

module.exports = AccountService;
