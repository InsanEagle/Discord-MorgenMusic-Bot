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
        "I'm sorry but you need to be in a voice channel to use bot's commands",
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
    if (!serverQueue.playing) {
      await player.unpause();
    }
    await player.stop();
    let embed = new EmbedBuilder()
      .setColor("0x0099ff")
      .setDescription(`Song **${serverQueue.songs[0].title}** is skipped`)
      .setTimestamp()
      .setFooter({
        text: "MorgenMusic",
        iconURL:
          "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
      });
    await serverQueue.songs.unshift();
    await interaction.editReply({ embeds: [embed] });
  },
};
