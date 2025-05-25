const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getBaseApiUrl() {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
}

module.exports = {
  name: "sing",
  run: async (ctx, bot) => {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) return ctx.reply("Please provide a YouTube link or song name after /sing.");

    const checkUrl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const isUrl = checkUrl.test(query);

    const chatId = ctx.chat.id;
    await ctx.reply("🔍 Searching...");

    try {
      const baseApi = await getBaseApiUrl();

      if (isUrl) {
        const videoID = query.match(checkUrl)[1];
        const { data: { title, downloadLink, size, thumbnail } } = await axios.get(`${baseApi}/ytDl3?link=${videoID}&format=mp3`);

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
        const res = await axios.get(`${baseApi}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        const results = res.data.slice(0, 6);

        if (results.length === 0) return ctx.reply(`❌ No results found for: ${query}`);

        // Send message with thumbnails and list of songs
        for (let i = 0; i < results.length; i++) {
          const song = results[i];
          // Send thumbnail + song info as caption
          await ctx.replyWithPhoto(song.thumbnail || '', { caption: `${i + 1}. ${song.title}\nChannel: ${song.channel.name}\nTime: ${song.time}` });
        }

        await ctx.reply("🎵 Reply with a number (1-6) to select a song:");

        const songMap = {};
        results.forEach((song, idx) => songMap[idx + 1] = song);

        // Wait for user reply for selection
        const listener = async (replyCtx) => {
          if (replyCtx.chat.id === chatId && /^[1-6]$/.test(replyCtx.text)) {
            const selected = parseInt(replyCtx.text);
            const song = songMap[selected];
            if (!song) return;

            bot.off("text", listener);
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

        bot.on("text", listener);
      }
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Something went wrong. Try again later.");
    }
  },
};
