const axios = require('axios');

const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post(
      `https://translate.googleapis.com/translate_a/single`,
      null,
      {
        params: {
          client: 'gtx',
          sl: 'auto',
          tl: targetLang,
          dt: 't',
          q: text,
        },
      }
    );
    const translated = response.data[0][0][0];
    return translated;
  } catch (error) {
    console.error('Error translating text:', error.message);
    throw new Error('Failed to translate the text. Please try again.');
  }
};

module.exports = {
  config: {
    name: "translate",
    prefix: true,
    aliases: ["tr"],
    credits: "Nayan",
    tags: ["Utility"],
    description: "Translate a message into a selected language.",
  },
  start: async ({ event, api }) => {
    const chatId = event.msg.chat.id;
    const text = event.body;

    if (!text) {
      return api.sendMessage(chatId, `❌ *Usage:* /translate <text>\n\n📌 Replace <text> with the message you want to translate.`, {
        parse_mode: 'Markdown',
      });
    }

    const languageMarkup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "English", callback_data: "en" }],
          [{ text: "Bangla", callback_data: "bn" }],
          [{ text: "Hindi", callback_data: "hi" }],
          [{ text: "Arabic", callback_data: "ar" }],
        ],
      },
    };

    const waitMsg = await api.sendMessage(chatId, "🌐 *Select a language to translate to:*", {
      parse_mode: "Markdown",
      ...languageMarkup,
    });

    api.once("callback_query", async (callbackQuery) => {
      if (callbackQuery.message.chat.id !== chatId) return;
      const langCode = callbackQuery.data;
      await api.deleteMessage(chatId, waitMsg.message_id);

      const waitTranslateMsg = await api.sendMessage(chatId, "Translating, please wait...");

      try {
        const translatedText = await translateText(text, langCode);

        await api.deleteMessage(chatId, waitTranslateMsg.message_id);
        api.sendMessage(chatId, `🌐 *Translated Message:*\n\n${translatedText}`, {
          parse_mode: "Markdown",
          reply_to_message_id: event.msg.message_id,
        });
      } catch (error) {
        await api.deleteMessage(chatId, waitTranslateMsg.message_id);
        api.sendMessage(chatId, "❌ Failed to translate. Please try again later.", {
          reply_to_message_id: event.msg.message_id,
        });
      }
    });
  },
};
