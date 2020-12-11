const Discord = require('discord.js');
const { searchByTitle } = require('../../utils');

module.exports = {
  actions: ['search'],
  handler: async (message, { args }) => {
    if (args.length === 0) return;

    const [title, year] = args;
    const res = await searchByTitle({ title, year });

    res.data.forEach((obj, i) => {
      const messageEmbed = new Discord.MessageEmbed();

      messageEmbed.setColor(i % 2 === 0 ? '#FFC300' : '#90E3DD');
      messageEmbed.setTitle(`${obj['Title']} (${obj['Year']})`);
      messageEmbed.setDescription(`ID ${obj['imdbID']}`);

      if (obj['Poster'] && obj['Poster'] !== 'N/A') {
        messageEmbed.setURL(obj['Poster']);
        messageEmbed.setThumbnail(obj['Poster']);
      }

      if (i === 0) {
        const foundMessage = `Lalo has found ${res.totalResults} movie(s). Page (${res.page}/${res.totalPages})`;
        message.channel.send(foundMessage);
      }

      message.channel.send(messageEmbed);
    });
  }
};
