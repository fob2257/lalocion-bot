const Discord = require('discord.js');
const { searchByTitle } = require('../../utils');

module.exports = {
  actions: ['search'],
  handler: async (message, { args }) => {
    if (args.length === 0 || args[0].length < 4) return;

    const maxArgs = 3;
    const { title, year, page } = [...args]
      .slice(0, maxArgs)
      .reduce((obj, val, i) => {
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
      }, {});

    const res = await searchByTitle({ title, year, page });

    const pageCounter = `Page (${res.page}/${res.totalPages}).`;
    const totalMoviesCounter =
      res.totalResults === 0
        ? `${res.totalResults} movies. Hmm, weird...`
        : `${res.totalResults} movie${
            res.totalResults > 1 ? 's' : ''
          }; showing ${res.data.length}. ${pageCounter}`;

    const foundMessage = `Lalo searched for ${title} and found ${totalMoviesCounter}`;
    await message.channel.send(foundMessage);

    if (res.error || res.totalResults === 0) return;

    await res.data.reduce((curr, obj, i, arr) => {
      const messageEmbed = new Discord.MessageEmbed();

      messageEmbed.setColor(i % 2 === 0 ? '#FFC300' : '#90E3DD');
      messageEmbed.setTitle(`${obj['Title']} (${obj['Year']})`);
      messageEmbed.setDescription(`ID ${obj['imdbID']}`);

      if (obj['Poster'] && obj['Poster'] !== 'N/A') {
        messageEmbed.setURL(obj['Poster']);
        messageEmbed.setThumbnail(obj['Poster']);
      }

      const newCurr = [...curr, message.channel.send(messageEmbed)];

      return i + 1 === arr.length ? Promise.all(newCurr) : newCurr;
    }, []);
  }
};
