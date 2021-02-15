const axios = require('axios');

const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

class NovaposhtaApi {
  constructor (token) {
    this.token = token;
  }

  get invoiceDocument () {
    const data = {
      apiKey: this.token,
      modelName: 'InternetDocument'
    }

    const getDocumentList = (params) => this.request(
      Object.assign({}, params, data, {
        calledMethod: 'getDocumentList'
      })
    );

    return { getDocumentList }
  }

  get trackingDocument () {
    const config = {
      apiKey: this.token,
      modelName: 'TrackingDocument'
    }

    const getStatusDocuments = (docs = []) => this.request(
      Object.assign({}, config, {
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: docs
        }
      })
    );

    return { getStatusDocuments }
  }

  async request (body = {}) {
    const { data: response = {} } = await axios.post(API_URL, body);

    const {
      success,
      data,
      errors
    } = response;

    if (!success) {
      console.log(response);

      throw new Error(errors.join('\n '));
    }

    return data;
  }
}

module.exports = NovaposhtaApi;
