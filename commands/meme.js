const axios = require("axios");

module.exports = {
  name: "meme",
  run: async function (ctx) {
    try {
      const apiBase = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
      const apiUrl = apiBase.data.mahmud;

      const res = await axios.get(`${apiUrl}/api/meme`);
      const imageUrl = res.data?.imageUrl;

      if (!imageUrl) {
        return ctx.reply("😕 মিম পাওয়া যায়নি, পরে চেষ্টা করুন।");
      }

      await ctx.replyWithPhoto({ url: imageUrl }, { caption: "🐸 Here's your random meme!" });

    } catch (err) {
      console.error("❌ meme কমান্ডে সমস্যা:", err.message);
      ctx.reply("❌ মিম আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    }
  }
};
