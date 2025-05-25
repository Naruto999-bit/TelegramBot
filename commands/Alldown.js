const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "autodl",
  noPrefix: true, // যাতে URL দিলে অটো কাজ করে
  run: async (ctx) => {
    const text = ctx.message.text;

    const supportedPrefixes = [
      "https://vt.tiktok.com",
      "https://www.tiktok.com/",
      "https://vm.tiktok.com",
      "https://www.facebook.com",
      "https://fb.watch",
      "https://www.instagram.com/",
      "https://www.instagram.com/p/",
      "https://youtu.be/",
      "https://youtube.com/",
      "https://x.com/",
      "https://twitter.com/",
      "https://pin.it/"
    ];

    if (!supportedPrefixes.some(prefix => text.startsWith(prefix))) return;

    try {
      await ctx.reply("⏳ অনুগ্রহ করে অপেক্ষা করো Baby...");

      const apiBase = (await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json")).data.api;
      const res = await axios.get(`${apiBase}/alldl?url=${encodeURIComponent(text)}`);
      const data = res.data;

      let ext = ".mp4";
      if (data.result.includes(".jpg")) ext = ".jpg";
      else if (data.result.includes(".jpeg")) ext = ".jpeg";
      else if (data.result.includes(".png")) ext = ".png";

      const filePath = path.join(__dirname, "..", "cache", `dlfile${ext}`);
      const buffer = (await axios.get(data.result, { responseType: "arraybuffer" })).data;

      await fs.ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, buffer);

      const shortUrl = (await axios.get(`https://tinyurl.com/api-create.php?url=${data.result}`)).data;
      const caption = `${data.cp || "তোমার ভিডিও/ছবি রেডি!"}\n🔗 ${shortUrl}`;

      if (ext === ".mp4") {
        await ctx.replyWithVideo({ source: filePath }, { caption });
      } else {
        await ctx.replyWithPhoto({ source: filePath }, { caption });
      }

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("❌ autodl error:", err.message);
      await ctx.reply("❌ ডাউনলোড করতে সমস্যা হয়েছে:\n" + err.message);
    }
  }
};
