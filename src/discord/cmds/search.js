const Discord = require('discord.js');
const randomHex = require('random-hex-color');
const { searchByTitle } = require('../../utils');

module.exports = {
  actions: ['search'],
  handler: async (message, { args }) => {
    if (args.length === 0 || args[0].length < 4) return;

    const maxArgs = 3;
    const params = [...args].slice(0, maxArgs).reduce((obj, val, i) => {
      if (i === 0) return { ...obj, title: val };

      const valMatches = val.match(/p[0-9]+/);
      if (valMatches) {
        const parsedMatchVal = Number.parseInt(valMatches[0].split('p')[1]);

        if (parsedMatchVal > 0 && `${parsedMatchVal}`.length <= 4) {
          return { ...obj, page: parsedMatchVal };
        }
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

    const res = await searchByTitle(params);

    const pageCounter = `Page (${res.page}/${res.totalPages}).`;
    const totalMoviesCounter =
      res.totalResults === 0
        ? `${res.totalResults} movies. Hmm, weird...`
        : res.totalResults === 1
        ? `${res.totalResults} movie.`
        : `${res.totalResults} movies. ${pageCounter}`;

    const messageEmbed = new Discord.MessageEmbed()
      .setColor(randomHex())
      .setTitle(`Lalo searched for \`${params.title}\``)
      .setDescription(`Found ${totalMoviesCounter}`);

    if (!(res.error || res.totalResults === 0)) {
      for (let i = 0; i < res.data.length; i += 1) {
        const obj = res.data[i];

        // messageEmbed.setTitle(`${obj['Title']} (${obj['Year']})`);
        // messageEmbed.setDescription(`ID ${obj['imdbID']}`);
        // messageEmbed.setThumbnail(obj['Poster']);
        //   \u200B

        let movieData = `**${obj['Title']} (${obj['Year']})**`;

        if (obj['Poster'] && obj['Poster'] !== 'N/A') {
          movieData = `[${movieData}](${obj['Poster']})`;
        }

        messageEmbed.addField(`ID ${obj['imdbID']}`, movieData);
      }
    }

    await message.channel.send(messageEmbed);
  }
};
