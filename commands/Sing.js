handleReply: async function ({ event, api, args, handleReply }) {
  const baseApi = (await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json")).data.api;

  const choice = parseInt(event.body);
  const selected = handleReply.result[choice - 1];
  if (!selected) return api.sendMessage("❌ Invalid number.", event.threadID);

  api.sendMessage(`⏬ Downloading "${selected.title}"...`, event.threadID);

  try {
    const res = await axios.get(`${baseApi}/ytDl3?link=${selected.id}&format=mp3`);
    const { title, downloadLink, size } = res.data;

    if (size > 26000000) return api.sendMessage("⭕ Sorry, audio size is more than 26MB.", event.threadID);

    const path = __dirname + `/cache/${title}.mp3`;
    const writer = fs.createWriteStream(path);
    const response = await axios.get(downloadLink, { responseType: "stream" });

    response.data.pipe(writer);
    writer.on("finish", () => {
      api.sendMessage({
        body: title,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path));
    });

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Something went wrong while downloading.", event.threadID);
  }
}
