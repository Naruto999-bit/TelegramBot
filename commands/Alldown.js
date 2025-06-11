const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "download",
  description: "Auto download video/photo from TikTok, Facebook, Instagram, YouTube and more",
  usage: "<video_url>",
  async run(ctx) {
    const text = ctx.message.text || "";
    const args = text.split(" ").slice(1);

    if (args.length === 0) {
      return ctx.reply("Please provide a video or photo URL to download.\nUsage: /download [link]");
    }

    const url = args[0].trim();

    const validLinks = [
      "https://vt.tiktok.com",
      "https://www.tiktok.com/",
      "https://vm.tiktok.com",
      "https://www.facebook.com",
      "https://fb.watch",
      "https://www.instagram.com/",
      "https://www.instagram.com/p/",
      "https://youtu.be/",
      "https://youtube.com/",
      "https://twitter.com/",
      "https://x.com/",
      "https://pin.it/"
    ];

    if (!validLinks.some(prefix => url.startsWith(prefix))) {
      return ctx.reply("Unsupported or invalid URL. Please provide a valid TikTok, Facebook, Instagram, YouTube or Twitter video/photo link.");
    }

    try {
      await ctx.reply("𝗮𝗶𝗶 𝗺𝗮𝗺𝗮 𝗗𝗮𝗿𝗮 𝗗𝗶𝘁𝗮𝘀𝗵𝗶, 30 𝘀𝗲𝗰 𝗧𝗶𝗺𝗲 𝗗𝗲𝗮 ⌛");

      const baseApiRes = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
      const baseApiUrl = baseApiRes.data.api;

      const response = await axios.get(`${baseApiUrl}/alldl?url=${encodeURIComponent(url)}`);
      const data = response.data;

      if (!data.result) {
        return ctx.reply("Failed to retrieve media. Please try again later.");
      }

      let extension = ".mp4";
      if (data.result.includes(".jpg")) extension = ".jpg";
      else if (data.result.includes(".png")) extension = ".png";
      else if (data.result.includes(".jpeg")) extension = ".jpeg";

      const cacheDir = path.join(__dirname, "..", "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `media${extension}`);

      const mediaResp = await axios.get(data.result, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, mediaResp.data);

      if (extension === ".mp4") {
        await ctx.replyWithVideo({ source: filePath }, { caption: data.cp || "Here's your video!" });
      } else {
        await ctx.replyWithPhoto({ source: filePath }, { caption: data.cp || "Here's your photo!" });
      }

      await fs.unlink(filePath);
    } catch (err) {
      console.error("Error in /download command:", err);
      ctx.reply("Sorry, something went wrong while processing your request.");
    }
  }
};
