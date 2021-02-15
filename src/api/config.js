// PQUEUE Docs: https://www.npmjs.com/package/p-queue

module.exports = {
  syncPQueueConfig: {
    concurrency: 1,
    intervalCap: 1,
    interval: 1000,
    timeout: 60000,
    throwOnTimeout: true
  }
}
