const axios = require("axios");

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${query}`);
    return response.data;
  } catch (error) {
    console.error("Video fetch error:", error);
    return null;
  }
}

module.exports = {
  name: "anisearch",
  run: async (ctx) => {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) return ctx.reply("দয়া করে একটি অ্যানিমে নাম লিখুন। যেমন: `/anisearch Naruto`");

    const modifiedQuery = `${query} anime edit`;

    const videos = await fetchTikTokVideos(modifiedQuery);

    if (!videos || videos.length === 0) {
      return ctx.reply(`দুঃখিত, "${query}" এর জন্য কোনো ভিডিও খুঁজে পাওয়া যায়নি।`);
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      return ctx.reply("ভিডিও লিংক পাওয়া যায়নি। দয়া করে পরে চেষ্টা করুন।");
    }

    try {
      const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
      const videoBuffer = Buffer.from(response.data, "binary");

      await ctx.replyWithVideo({ source: videoBuffer }, { caption: `${query} edit video` });
    } catch (err) {
      console.error("Video send error:", err.message);
      ctx.reply("ভিডিও পাঠাতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।");
    }
  }
};
