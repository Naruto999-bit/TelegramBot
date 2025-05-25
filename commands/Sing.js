const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getBaseApiUrl() {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
}

module.exports = {
  name: "sing",
  run: async (ctx) => {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) return ctx.reply("Please provide a YouTube link or song name after /sing.");

    const checkUrl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const isUrl = checkUrl.test(query);

    const chatId = ctx.chat.id;
    await ctx.reply("🔍 Searching...");

    try {
      if (isUrl) {
        const videoID = query.match(checkUrl)[1];
        const baseApi = await getBaseApiUrl();
        const { data: { title, downloadLink, size } } = await axios.get(`${baseApi}/ytDl3?link=${videoID}&format=mp3`);

        if (size > 26000000) return ctx.reply("⭕ Sorry, the audio size is more than 26MB.");

        const filePath = path.join(__dirname, `${title}.mp3`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(downloadLink, { responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", async () => {
          await ctx.replyWithAudio({ source: filePath }, { caption: title });
          fs.unlinkSync(filePath);
        });

      } else {
        // keyword search
        const baseApi = await getBaseApiUrl();
        const res = await axios.get(`${baseApi}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        const results = res.data.slice(0, 6);

        if (results.length === 0) return ctx.reply(`❌ No results found for: ${query}`);

        let text = "🎵 Select a song by replying with a number (1-6):\n\n";
        const songMap = {};

        for (let i = 0; i < results.length; i++) {
          const song = results[i];
          text += `${i + 1}. ${song.title}\nChannel: ${song.channel.name}\nTime: ${song.time}\n\n`;
          songMap[i + 1] = song;
        }

        await ctx.reply(text);

        // Set up listener for reply (one time)
        const onReply = async (replyCtx) => {
          if (replyCtx.message.chat.id === chatId && /^[1-6]$/.test(replyCtx.message.text)) {
            const selected = parseInt(replyCtx.message.text);
            const song = songMap[selected];
            if (!song) return;

            bot.off("text", onReply);
            await ctx.reply(`⏬ Downloading "${song.title}"...`);

            try {
              const { data: { title, downloadLink, size } } = await axios.get(`${baseApi}/ytDl3?link=${song.id}&format=mp3`);

              if (size > 26000000) return ctx.reply("⭕ Audio size exceeds 26MB.");

              const filePath = path.join(__dirname, `${title}.mp3`);
              const writer = fs.createWriteStream(filePath);
              const stream = await axios.get(downloadLink, { responseType: "stream" });
              stream.data.pipe(writer);

              writer.on("finish", async () => {
                await ctx.replyWithAudio({ source: filePath }, { caption: title });
                fs.unlinkSync(filePath);
              });
            } catch (e) {
              console.error(e);
              await ctx.reply("❌ Error downloading audio.");
            }
          }
        };

        bot.on("text", onReply);
      }
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Something went wrong. Try again later.");
    }
  },
};
