const axios = require("axios");
const fs = require("fs");
const https = require("https");
const path = require("path");

module.exports = {
  name: "info",
  description: "Admin and Bot Information",
  category: "info",
  usage: "/inf",
  cooldown: 2,
  hasPermission: 0,
  credits: "Arun Kumar",

  run: async (ctx) => {
    const botName = "🌊ʸᵒᵘʳ Cʜᴏᴄᴏʟᴀᴛᴇ🍭"; // Replace if dynamic
    const prefix = "/";
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const moment = require("moment-timezone");
    const timeNow = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【HH:mm:ss】");

    const imageLinks = [
      "https://i.postimg.cc/7Lbh7QF6/received-517669337949724.jpg",
      "https://i.imgur.com/BUxdUfU.jpeg",
      "https://i.imgur.com/X4vEaKg.jpeg",
      "https://i.imgur.com/TJTwLQO.jpeg"
    ];
    const selectedImage = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    const caption = `🌹𝙰𝙳𝙼𝙸𝙽 𝙰𝙽𝙳 𝙱𝙾𝚃 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 🎀

☄️𝗕𝗢𝗧 𝗡𝗔𝗠𝗘☄️ ⚔ ${botName} ⚔

🔥𝗢𝗪𝗡𝗘𝗥 🔥☞︎︎︎ 𝗔𝗿𝗮𝗳𝗮𝘁 🫩 ☜︎︎︎✰

🙈🄾🅆🄽🄴🅁 🄲🄾🄽🅃🄰🄲🅃 🄻🄸🄽🄺🅂🙈➪ 
𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 🧨 https://www.facebook.com/arafatas602
𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 👉 @iam_arafat_602

🌸𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅🌸 ${prefix}
🥳 UPTIME: ${hours}h ${minutes}m ${seconds}s
🌪️ DATE: ${timeNow}
✅ Thanks for using my bot ❤ ${botName}`;

    const imagePath = path.join(__dirname, "cache", "info.jpg");
    const file = fs.createWriteStream(imagePath);

    https.get(selectedImage, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        ctx.replyWithPhoto({ source: imagePath }, { caption }).then(() => {
          fs.unlinkSync(imagePath);
        });
      });
    }).on("error", (err) => {
      ctx.reply("Image fetch failed, but here is the info:\n\n" + caption);
    });
  }
};
