const axios = require("axios");
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN); // টোকেন লোড করা আছে, তাই পরিবেশ ভ্যারিয়েবল ধরেই নিচ্ছি

// হেল্পার ফাংশন
async function dipto(url) {
  const response = await axios.get(url, { responseType: "stream" });
  return response.data;
}

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
  return base.data.api;
};

const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

bot.command("sing", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (!args.length) return ctx.reply("⭕ দয়া করে একটি গান বা ইউটিউব লিংক দিন।");

  const input = args.join(" ").replace("?feature=share", "");
  const isUrl = checkurl.test(input);

  try {
    if (isUrl) {
      const match = input.match(checkurl);
      const videoID = match ? match[1] : null;
      const { data: { title, downloadLink, size } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);

      if (size > 26000000) return ctx.reply("⭕ দুঃখিত, অডিও ফাইলটি ২৬MB এর বেশি।");

      const audioStream = await dipto(downloadLink);
      return ctx.replyWithAudio({ source: audioStream, filename: `${title}.mp3` }, { caption: title });
    } else {
      const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${input}`)).data;
      if (!result.length) return ctx.reply(`⭕ কোনো গান পাওয়া যায়নি: ${input}`);

      const firstResult = result[0];
      const videoID = firstResult.id;

      const { data: { title, downloadLink, size } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);

      if (size > 26000000) return ctx.reply("⭕ দুঃখিত, অডিও ফাইলটি ২৬MB এর বেশি।");

      const audioStream = await dipto(downloadLink);
      return ctx.replyWithAudio({ source: audioStream, filename: `${title}.mp3` }, { caption: title });
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ সমস্যা হয়েছে: " + err.message);
  }
});

bot.launch();
