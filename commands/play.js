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
    .setName("play")
    .setDescription("Playing music")
    .addStringOption((option) =>
      option
        .setName("songname")
        .setDescription("Input songname to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    let channel = interaction.member.voice.channel;

    if (!channel) {
      return sendError(
        "I'm sorry but you need to be in a voice channel to play music!",
        interaction.channel
      );
    }

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    let songname = interaction.options.getString("songname");
    let searched = await yts.search(songname);

    if (searched.videos.length === 0) {
      return sendError(
        "Looks like i was unable to find the song on YouTube",

        interaction.channel
      );
    }

    interaction.reply(`Searching: ${songname}`);

    let song = null;
    let songInfo = null;
    let songNumber = 0;

    songInfo = searched.videos[songNumber];

    song = {
      id: songInfo.videoId,
      title: songInfo.title,
      views: String(songInfo.views).padStart(10, " "),
      url: songInfo.url,
      ago: songInfo.ago,
      duration: songInfo.duration.toString(),
      img: songInfo.image,
      req: interaction.member,
    };

    const songEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${song.title}`)
      .setURL(`${song.url}`)
      .setAuthor({
        name: "Морген Штерн",
        iconURL: song.img,
        url: song.img,
      })
      .setDescription(`Duration: ${song.duration}`)
      .setThumbnail(song.img)
      .addFields(
        { name: "Views", value: song.views },
        { name: "\u200B", value: "\u200B" },
        { name: "У У У У", value: "А А А А", inline: true },
        { name: "У У У У", value: "А А А А", inline: true }
      )
      .addFields({
        name: "У У У У",
        value: "А А А А",
        inline: true,
      })
      .setImage(song.img)
      .setTimestamp()
      .setFooter({
        text: "Найс музычка",
        iconURL: song.img,
      });

    await interaction.channel.send({ embeds: [songEmbed] });

    let stream = await ytdl(song.url, {
      quality: "highestaudio",

      highWaterMark: 1 << 25,

      type: "opus",
    });

    const player = createAudioPlayer();

    let resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, async () => {
      songInfo = searched.videos[songNumber];

      song = {
        id: songInfo.videoId,
        title: songInfo.title,
        views: String(songInfo.views).padStart(10, " "),
        url: songInfo.url,
        ago: songInfo.ago,
        duration: songInfo.duration.toString(),
        img: songInfo.image,
        req: interaction.member,
      };

      const songEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${song.title}`)
        .setURL(`${song.url}`)
        .setAuthor({
          name: "Морген Штерн",
          iconURL: song.img,
          url: song.img,
        })
        .setDescription(`Duration: ${song.duration}`)
        .setThumbnail(song.img)
        .addFields(
          { name: "Views", value: song.views },
          { name: "\u200B", value: "\u200B" },
          { name: "У У У У", value: "А А А А", inline: true },
          { name: "У У У У", value: "А А А А", inline: true }
        )
        .addFields({
          name: "У У У У",
          value: "А А А А",
          inline: true,
        })
        .setImage(song.img)
        .setTimestamp()
        .setFooter({
          text: "Найс музычка",
          iconURL: song.img,
        });

      await interaction.channel.send({ embeds: [songEmbed] });

      ++songNumber;

      stream = await ytdl(searched.videos[songNumber].url, {
        quality: "highestaudio",

        highWaterMark: 1 << 25,

        type: "opus",
      });

      resource = createAudioResource(stream);

      player.play(resource);
    });
  },
};
