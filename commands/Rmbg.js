const axios = require("axios");

module.exports = {
  name: "rmbg",
  run: async (ctx) => {
    const photos = ctx.message.reply_to_message?.photo;
    const apiKey = "6zHyVXej7f4QNTVNQU7VcUwm";

    if (!photos) {
      return ctx.reply("দয়া করে একটি ছবিতে রিপ্লাই দিয়ে `/rmbg` লিখুন।");
    }

    const fileId = photos[photos.length - 1].file_id;

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);

      const res = await axios({
        method: "post",
        url: "https://api.remove.bg/v1.0/removebg",
        data: {
          image_url: fileLink.href,
          size: "auto"
        },
        headers: {
          "X-Api-Key": apiKey
        },
        responseType: "arraybuffer"
      });

      const imageBuffer = Buffer.from(res.data, "binary");

      await ctx.replyWithPhoto({ source: imageBuffer }, { caption: "ব্যাকগ্রাউন্ড রিমুভ করা হয়েছে!" });

    } catch (err) {
      console.error(err?.response?.data || err.message);
      ctx.reply("ব্যাকগ্রাউন্ড রিমুভ করতে সমস্যা হয়েছে। API key বা ছবির লিংকে সমস্যা থাকতে পারে।");
    }
  }
};
