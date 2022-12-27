const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core-discord");
const sendError = require("../error/error");
const getData = require("../puppeteer_parser/getData");
const dataParse = require("../puppeteer_parser/dataParse");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Playing music")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Input song to play")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    let channel = interaction.member.voice.channel;
    const serverQueue = interaction.client.queue.get(interaction.guild.id);

    if (!channel) {
      sendError(
        "I'm sorry but you need to be in a voice channel to use bot's commands",
        interaction
      );
      return;
    }

    let songname = interaction.options.getString("song");
    console.log(`Searching song at server: ${interaction.guild.id}`);

    let searched;

    try {
      const rawHTML = await getData(songname);
      searched = await dataParse(rawHTML);
    } catch {
      sendError(`Couldn't find a song. Try again`, interaction);
      return;
    }

    if (Object.keys(searched).length === 0) {
      sendError(
        "Looks like i was unable to find the song on YouTube",
        interaction
      );
      return;
    }

    let song = null;
    let songInfo = null;

    songInfo = searched[0];

    song = {
      // id: songInfo.id.videoId,
      title: songInfo.title,
      // views: additionalInfo.items[0].statistics.viewCount.replace(
      //   /\B(?=(\d{3})+(?!\d))/g,
      //   " "
      // ),
      url: songInfo.url,
      // ago: songInfo.snippet.publishedAt,
      duration: songInfo.duration,
      // timestamp: songInfo.timestamp,
      // img: additionalInfo.items[0].snippet.thumbnails.maxres.url,
      req: interaction.member,
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      console.log(`Song added to queue at server: ${interaction.guild.id}`);

      let embed = new EmbedBuilder()
        .setColor("0x0099ff")
        .setDescription(
          `Song **${
            serverQueue.songs[serverQueue.songs.length - 1].title
          }** added to queue`
        )
        .setTimestamp()
        .setFooter({
          text: "MorgenMusic",
          iconURL:
            "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
        });

      return await interaction.editReply({ embeds: [embed] });
    }

    const queueConstruct = {
      textChannel: interaction.channel,
      voiceChannel: channel,
      connection: null,
      player: null,
      songs: [],
      playing: true,
      loop: false,
    };

    interaction.client.queue.set(interaction.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    const play = async (song, followUp) => {
      const queue = interaction.client.queue.get(interaction.guild.id);

      if (!song) {
        interaction.client.queue.delete(interaction.guild.id);
        return;
      }

      let stream;
      let resource;
      let player = createAudioPlayer();

      queueConstruct.player = player;

      try {
        console.log(`Creating audio stream at server: ${interaction.guild.id}`);
        console.log(`Audio stream url: ${song.url}`);

        stream = await ytdl(song.url, {
          quality: "highestaudio",

          highWaterMark: 1 << 25,

          type: "opus",
        });

        resource = createAudioResource(stream);

        stream.on("error", function (er) {
          if (er) {
            if (queue) {
              queue.songs.shift();
              play(queue.songs[0]);

              sendError(
                `An unexpected error has occurred.\nPossible type \`${er}\``,
                interaction
              );
              return;
            }
          }
        });
      } catch (error) {
        if (queue) {
          queue.songs.shift();
          play(queue.songs[0]);
        }
      }

      queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
        interaction.client.queue.delete(interaction.guild.id);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log(`Player is idle at server: ${interaction.guild.id}`);
        const shiffed = queue.songs.shift();

        if (queue.loop === true) {
          queue.songs.push(shiffed);
        }

        play(queue.songs[0], true);
      });

      console.log(`Playing song at server: ${interaction.guild.id}`);
      try {
        player.play(resource);
      } catch {
        sendError(`Couldn't play a song. Try again`, interaction);
        return;
      }
      queue.connection.subscribe(player);

      const songEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${song.title} (${song.duration})`)
        .setURL(`${song.url}`)
        // .setDescription(`Views: ${song.views}`)
        // .setImage(song.img)
        .setTimestamp()
        .setFooter({
          text: "MorgenMusic",
          iconURL:
            "https://raw.githubusercontent.com/InsanEagle/Discord-MorgenMusic-Bot/main/img/morgenmusic.jpg",
        });

      if (!followUp) {
        await interaction.editReply({ embeds: [songEmbed] });
      } else {
        await interaction.followUp({ embeds: [songEmbed] });
      }
    };

    try {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      queueConstruct.connection = connection;

      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);

      interaction.client.queue.delete(interaction.guild.id);

      await channel.leave();

      sendError(`I could not join the voice channel: ${error}`, interaction);
      return;
    }
  },
};
