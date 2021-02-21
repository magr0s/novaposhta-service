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
      statuses = [],
      clearStatuses = []
    }) =>
      async () => {
        const np = new NovaposhtaApi(apiKey);

        const cacheKeys = Object.keys(documentsCache);

        try {
          const list = (
            await np.invoiceDocument.getDocumentList({ GetFullList: 1 })
          ).reduce((memo, { IntDocNumber: DocumentNumber }) => {
              // filter only new document
              !cacheKeys.includes(DocumentNumber) &&
                memo.push({ DocumentNumber });

              return memo;
            }, [])
            // marge with cache
            .concat(
              // prepare
              cacheKeys.map((DocumentNumber) => ({ DocumentNumber }))
            );

          if (!list.length) {
            return ;
          }

          // Chunking list
          const chunks = [];

          for (let i = 0; i < list.length; i += 100) {
            chunks.push(
              list.slice(i, i + 100)
            )
          }

          const documents = await Promise.all(
            chunks.map((chunk) => np.trackingDocument.getStatusDocuments(chunk))
          )
            .then((results) => results.reduce((memo, arr) => [...memo, ...arr], []));

          // account has documents cache
          const promises = documents.reduce((p, data) => {
            const {
              Number: number,
              StatusCode: statusCode
            } = data;

            // docuemnt in cache and has status
            const inCacheAndUpdate = typeof (documentsCache[number]) !== 'undefined' &&
              statuses.includes(statusCode) &&
              documentsCache[number] !== statusCode;

            // document notin cache but has status
            const nonCacheAndUpdate = typeof (documentsCache[number]) === 'undefined' &&
              statuses.includes(statusCode);

            if (inCacheAndUpdate || nonCacheAndUpdate) {
              const request = axios.post(url, data, {
                headers: { 'Content-Type': 'application/json' }
              })
                .catch(err => {});

              p.push(request);
            }

            return p;
          }, []);

          await Promise.all(promises);

          // Build new account cache
          const cache = documents.reduce((acc, { Number: number, StatusCode: statusCode }) => {
            acc[number] = statusCode;

            return acc;
          }, {});

          // Clear account cache
          Object.entries(cache)
            .forEach(([k, v]) => clearStatuses.includes(v) && delete cache[k]);

          await Account.updateOne({ apiKey }, {
            documentsCache: cache
          });
        } catch (err) {
          console.log(err);

          // send error message to tg chat
          await TelegramBot.sendMessage(`[${apiKey}] ${err.toString()}`);
        }
      }
    );

    await pqueue.addAll(queue);
  }
}

module.exports = AccountService;
