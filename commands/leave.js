const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const sendError = require("../error/error");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Make bot to leave voice channel"),
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
    if (serverQueue) {
      let player = await serverQueue.player;
      await player.stop();
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) {
      connection.destroy();
    }
    interaction.client.queue.delete(interaction.guild.id);

    let embed = new EmbedBuilder()
      .setColor("0x0099ff")
      .setDescription(`MorgenMusic bot is left voice channel`)
      .setTimestamp()
      .setFooter({
        text: "MorgenMusic",
        iconURL:
          "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
      });
    await interaction.editReply({ embeds: [embed] });
  },
};
