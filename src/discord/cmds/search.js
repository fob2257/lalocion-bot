const {
  searchByTitle,
  isImdbID,
  isValidYear,
  generateMessageEmbed
} = require('../../utils');
const searchOne = require('./searchOne');

module.exports = {
  actions: ['search', 's'],
  handler: async (message, { args }) => {
    if (args.length === 0 || args[0].length < 3) return;

    if (isImdbID(args[0])) return searchOne.handler(message, { args });

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

      return isValidYear(val) ? { ...obj, year: val } : { ...obj };
    }, {});

    const res = await searchByTitle(params);

    const pageCounter = `Page (${res.page}/${res.totalPages}).`;
    const totalMoviesCounter =
      res.totalResults === 0
        ? `${res.totalResults} movies. :disappointed_relieved:`
        : res.totalResults === 1
        ? `${res.totalResults} movie.`
        : `${res.totalResults} movies. ${pageCounter}`;

    const messageEmbed = generateMessageEmbed()
      .setTitle(`Lalo searched for \`${params.title}\``)
      .setDescription(`Found ${totalMoviesCounter}`);

    if (!(res.error || res.totalResults === 0)) {
      for (let i = 0; i < res.data.length; i += 1) {
        const obj = res.data[i];

        let movieData = `**${obj['Title']} (${obj['Year']})**`;

        if (obj['Poster'] && obj['Poster'] !== 'N/A') {
          movieData = `[${movieData}](${obj['Poster']})`;
        }

        messageEmbed.addField(`ID ${obj.imdbID}`, movieData);
      }
    }

    await message.channel.send(messageEmbed);
  }
};
