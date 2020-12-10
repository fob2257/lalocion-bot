const Discord = require('discord.js');
const { searchByTitle } = require('../../utils');

module.exports = {
  actions: ['search'],
  handler: async (message, { args }) => {
    if (args.length === 0) return;

    const [title, year] = args;
    const res = await searchByTitle({ title, year });
    const slicedData = res.data.slice(0, 2);

    slicedData
      .map((obj, i) => {
        const messageEmbed = new Discord.MessageEmbed();

        messageEmbed.setColor(i % 2 === 0 ? '#FFC300' : '#90E3DD');
        messageEmbed.setTitle(`${obj['Title']} (${obj['Year']})`);
        messageEmbed.setFooter(`ID ${obj['imdbID']}`);
        // messageEmbed.setURL(obj['Poster']);
        // messageEmbed.setThumbnail(obj['Poster']);
        messageEmbed.setImage(obj['Poster']);
        // messageEmbed.attachFiles(obj['ClippedImage'].buffer);

        return messageEmbed;
      })
      .forEach((messageEmbed) => message.channel.send(messageEmbed));
  }
};
