const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();  // .env থেকে টোকেন নেয়ার জন্য

const TOKEN = process.env.BOT_TOKEN;  // তোমার টোকেন .env ফাইলে BOT_TOKEN হিসেবে থাকবে

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
};

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/sing (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const isUrl = checkurl.test(query);

  try {
    if (isUrl) {
      const matchUrl = query.match(checkurl);
      const videoID = matchUrl ? matchUrl[1] : null;

      const { data: { title, downloadLink, size } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);

      if (size > 26000000) {
        return bot.sendMessage(chatId, `⭕ Sorry, the audio size is more than 26MB.`);
      }

      const audioStream = await getStream(downloadLink);
      return bot.sendAudio(chatId, audioStream, {}, { filename: `${title}.mp3` });
    } else {
      const keyWord = query.replace("?feature=share", "");
      const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data;

      if (result.length === 0) {
        return bot.sendMessage(chatId, `⭕ No search results match the keyword: ${keyWord}`);
      }

      const firstSong = result[0];
      const idvideo = firstSong.id;

      const { data: { title, downloadLink, size } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`);

      if (size > 26000000) {
        return bot.sendMessage(chatId, `⭕ Sorry, the audio size is more than 26MB.`);
      }

      const audioStream = await getStream(downloadLink);
      return bot.sendAudio(chatId, audioStream, {}, { filename: `${title}.mp3` });
    }
  } catch (error) {
    return bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

async function getStream(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}
