const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// নিরাপদ উপায়ে টোকেন সংগ্রহ (প্রসেস এনভায়রনমেন্ট থেকে)
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// মাহমুদ API URL রিট্রিভ
const getMahmudApiBase = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return res.data.mahmud;
};

// /meme কমান্ড হ্যান্ডলার
bot.onText(/\/meme/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const apiUrl = await getMahmudApiBase();
    const res = await axios.get(`${apiUrl}/api/meme`);
    const imageUrl = res.data?.imageUrl;

    if (!imageUrl) {
      return bot.sendMessage(chatId, "😕 মিম আনতে পারিনি, একটু পরে আবার চেষ্টা করুন।");
    }

    await bot.sendPhoto(chatId, imageUrl, {
      caption: "🐸 Here's your random meme!"
    });

  } catch (err) {
    console.error("❌ Meme আনতে সমস্যা:", err.message);
    bot.sendMessage(chatId, "❌ সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
  }
});
