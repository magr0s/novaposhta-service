const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN = process.env.TGBOT_TOKEN;
const CHAT_ID = process.env.TGCHAT_ID;

const API_URL = `https://api.telegram.org/bot${TOKEN}`;

class TelegramBot {
  static async sendMessage (text = 'test message') {
    try {
      await axios.post(`${API_URL}/sendMessage`, {
        chat_id: CHAT_ID,
        parse_mode: 'HTML',
        text
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = TelegramBot;
