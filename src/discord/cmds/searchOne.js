const Discord = require('discord.js');
const randomHex = require('random-hex-color');
const { searchOneByIdOrTitle } = require('../../utils');

module.exports = {
  actions: ['searchOne', 'so'],
  handler: async (message, { args }) => {
    if (args.length === 0 || args[0].length < 4) return;

    const maxArgs = 2;
    const params = [...args].slice(0, maxArgs).reduce((obj, val, i) => {
      if (i === 0) {
        const matches = /ev\d{7}\/\d{4}(-\d)?|(ch|co|ev|nm|tt)\d{7}/.test(val);

        return matches ? { ...obj, id: val } : { ...obj, title: val };
      }

      const parsedVal = Number.parseInt(val);
      if (
        val.length === 4 &&
        parsedVal >= 1910 &&
        parsedVal <= new Date().getFullYear()
      ) {
        return { ...obj, year: val };
      }

      return { ...obj };
    }, {});

    const res = await searchOneByIdOrTitle(params);

    const messageEmbed = new Discord.MessageEmbed().setColor(randomHex());

    if (!res.data || res.error) {
      messageEmbed
        .setTitle(`Lalo searched for \`${args[0]}\``)
        .setDescription('Got no results :disappointed_relieved:');
    } else {
      messageEmbed.setTitle(`${res.data['Title']} (${res.data['Year']})`);
      messageEmbed.setDescription(res.data['Plot']);

      if (res.data['Poster'] && res.data['Poster'] !== 'N/A') {
        messageEmbed.setThumbnail(res.data['Poster']);
      }

      messageEmbed.addFields(
        ['Genre', 'Rated', 'Director', 'Writer', 'Actors'].map((key, i) => ({
          name: key,
          value: res.data[key],
          inline: i <= 1
        }))
      );

      if (res.data['Ratings'] && res.data['Ratings'].length) {
        messageEmbed.addField(
          'Ratings',
          res.data['Ratings'].reduce(
            (curr, obj) => `${curr}${obj['Source']} - ${obj['Value']}\n`,
            ''
          )
        );
      }

      messageEmbed.setFooter(`ID ${res.data['imdbID']}`);
    }

    await message.channel.send(messageEmbed);
  }
};
