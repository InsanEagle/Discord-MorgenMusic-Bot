const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { AudioPlayerStatus } = require("@discordjs/voice");
const sendError = require("../error/error");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unpause")
    .setDescription("Unpauses the current track"),
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
      if (!serverQueue.playing) {
        let player = await serverQueue.player;
        await player.unpause();
        serverQueue.playing = true;

        let embed = new EmbedBuilder()
          .setColor("0x0099ff")
          .setDescription(`Player has been unpaused`)
          .setTimestamp()
          .setFooter({
            text: "MorgenMusic",
            iconURL:
              "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
          });
        await interaction.editReply({ embeds: [embed] });
      } else {
        let embed = new EmbedBuilder()
          .setColor("0x0099ff")
          .setDescription(`Player is already unpaused`)
          .setTimestamp()
          .setFooter({
            text: "MorgenMusic",
            iconURL:
              "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
          });
        await interaction.editReply({ embeds: [embed] });
      }
    } else {
      let embed = new EmbedBuilder()
        .setColor("0x0099ff")
        .setDescription(`There is nothing to unpause`)
        .setTimestamp()
        .setFooter({
          text: "MorgenMusic",
          iconURL:
            "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
        });
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
