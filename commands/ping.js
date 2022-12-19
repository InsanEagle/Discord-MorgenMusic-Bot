const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  createAudioPlayer,
  getVoiceConnection,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} = require("@discordjs/voice");
const path = require("node:path");
const { createReadStream } = require("node:fs");
const ytdl = require("ytdl-core-discord");
const sendError = require("../error/error");
const yts = require("yt-search");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping bot to see latency"),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    interaction.editReply(
      `Roundtrip latency: ${
        sent.createdTimestamp - interaction.createdTimestamp
      }ms`
    );
  },
};
