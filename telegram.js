const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

const token = 'TU_TOKEN_DE_BOT';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/verificar (.+)/, (msg, match) => {
  const otp = match[1];
  const chatId = msg.chat.id;

  db.get('SELECT * FROM users WHERE otp = ? AND telegram IS NULL', [otp], (err, row) => {
    if (row) {
      db.run('UPDATE users SET telegram = ?, verified = 1 WHERE id = ?', [chatId, row.id]);
      bot.sendMessage(chatId, '✅ Verificación exitosa por Telegram.');
    } else {
      bot.sendMessage(chatId, '❌ Código inválido o ya usado.');
    }
  });
});

module.exports = bot;
