const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Replace with your actual token
const token = process.env.TELEGRAM_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const bot = new TelegramBot(token, { polling: true });

async function getBaseApiUrl() {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
}

// Song Command
bot.onText(/^\/sing (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  const checkUrl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const isUrl = checkUrl.test(query);

  bot.sendMessage(chatId, "🔍 Searching...");

  try {
    if (isUrl) {
      const videoID = query.match(checkUrl)[1];
      const { data: { title, downloadLink, size } } = await axios.get(`${await getBaseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);
      if (size > 26000000) return bot.sendMessage(chatId, "⭕ Sorry, the audio size is more than 26MB.");

      const filePath = path.join(__dirname, `${title}.mp3`);
      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(downloadLink, { responseType: "stream" });
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await bot.sendAudio(chatId, filePath, { caption: title });
        fs.unlinkSync(filePath); // delete after sending
      });

    } else {
      // keyword search
      const res = await axios.get(`${await getBaseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(query)}`);
      const results = res.data.slice(0, 6);
      if (results.length === 0) return bot.sendMessage(chatId, `❌ No results found for: ${query}`);

      let text = "🎵 Select a song by replying with a number (1-6):\n\n";
      const songMap = {};

      for (let i = 0; i < results.length; i++) {
        const song = results[i];
        text += `${i + 1}. ${song.title}\nChannel: ${song.channel.name}\nTime: ${song.time}\n\n`;
        songMap[i + 1] = song;
      }

      bot.sendMessage(chatId, text);

      // Wait for reply
      const listener = (replyMsg) => {
        if (replyMsg.chat.id === chatId && /^[1-6]$/.test(replyMsg.text)) {
          const selected = parseInt(replyMsg.text);
          const song = songMap[selected];
          if (!song) return;

          bot.removeListener("message", listener);
          bot.sendMessage(chatId, `⏬ Downloading "${song.title}"...`);

          axios.get(`${getBaseApiUrl()}/ytDl3?link=${song.id}&format=mp3`)
            .then(async ({ data: { title, downloadLink, size } }) => {
              if (size > 26000000) return bot.sendMessage(chatId, "⭕ Audio size exceeds 26MB.");

              const filePath = path.join(__dirname, `${title}.mp3`);
              const writer = fs.createWriteStream(filePath);
              const stream = await axios.get(downloadLink, { responseType: "stream" });
              stream.data.pipe(writer);

              writer.on("finish", async () => {
                await bot.sendAudio(chatId, filePath, { caption: title });
                fs.unlinkSync(filePath);
              });
            }).catch(err => {
              bot.sendMessage(chatId, "❌ Error downloading audio.");
              console.error(err);
            });
        }
      };

      bot.on("message", listener);
    }

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Something went wrong. Try again later.");
  }
});
