const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const sendError = require("../error/error");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip current playing song"),
  async execute(interaction) {
    await interaction.deferReply();

    let channel = await interaction.member.voice.channel;
    if (!channel) {
      sendError(
        "I'm sorry but you need to be in a voice channel to play music!",
        interaction
      );
      return;
    }

    let serverQueue = await interaction.client.queue.get(interaction.guild.id);
    if (!serverQueue || !serverQueue?.songs?.length) {
      sendError(
        "There is nothing playing that I could skip for you.",
        interaction
      );
      return;
    }

    let player = await serverQueue.player;
    await player.stop();
    let embed = new EmbedBuilder()
      .setColor("0x0099ff")
      .setDescription(`Song **${serverQueue.songs[0].title}** is skipped`);
    await serverQueue.songs.unshift();
    await interaction.editReply({ embeds: [embed] });
  },
};
