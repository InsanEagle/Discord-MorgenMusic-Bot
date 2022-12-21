const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const sendError = require("../error/error");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show your queue"),
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
      sendError("Queue is empty", interaction);
      return;
    }

    let queue = [];
    let queueLength = serverQueue.songs.length;

    for (let i = 0; i < queueLength; i++) {
      queue.push(
        `**${i + 1}** — ${serverQueue.songs[i].title} **(${
          serverQueue.songs[i].timestamp
        })**`
      );
    }
    queue.reverse;

    const queueEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setDescription(queue.join("\n"))
      .setTimestamp()
      .setFooter({
        text: "MorgenMusic",
        iconURL:
          "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
      });

    await interaction.editReply({ embeds: [queueEmbed] });
  },
};
