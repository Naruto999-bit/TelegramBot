module.exports = {
  name: "ping",
  description: "Check the bot's response time.",
  run: async (ctx) => {
    const start = Date.now();
    const sent = await ctx.reply("Pinging...");
    const end = Date.now();
    const latency = end - start;

    sent.editText(`🏓 Pong! Response time: \`${latency}ms\``, {
      parse_mode: "Markdown",
    });
  },
};
