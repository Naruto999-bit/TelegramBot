module.exports = {
  name: "ping",
  description: "Check bot response time",
  run: async (ctx) => {
    const start = Date.now();
    const latency = Date.now() - start;
    ctx.reply(`Pong ${latency}ms`);
  },
};
