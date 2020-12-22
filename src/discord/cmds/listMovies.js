const {
  isValidPage,
  isWatchedVal,
  isValidDate,
  generateMessageEmbed,
  getMovies
} = require('../../utils');

module.exports = {
  actions: ['listMovies', 'list'],
  handler: async (message, { args }) => {
    const maxArgs = 3;
    const params = [...args].slice(0, maxArgs).reduce((obj, val) => {
      if (isValidPage(val)) {
        const pageVal = val.split('p')[1];

        if (pageVal.length <= 4 && !obj.page) {
          obj.page = Number.parseInt(pageVal);
        }
      }

      if (isWatchedVal(val) && obj.watched === undefined) {
        obj.watched = true;
      }

      if (isValidDate(val)) {
        const hours = !obj.endDate ? '23:59:59' : '00:00:00';
        const dateVal = `${val.split('/').reverse().join('-')} ${hours}`;
        const parsedDate = Date.parse(new Date(dateVal));

        if (!obj.endDate) obj.endDate = parsedDate;

        if (
          obj.endDate &&
          obj.startDate === undefined &&
          obj.endDate > parsedDate
        ) {
          obj.startDate = parsedDate;
        }
      }

      return { ...obj };
    }, {});

    const res = await getMovies(params);

    const watchTitle = params.watched ? 'Watched' : 'Pending to watch';
    const pageCounter = `Page (${res.page}/${res.totalPages}).`;
    const totalMoviesCounter =
      res.totalResults === 0
        ? `${res.totalResults} movies. :flushed:`
        : res.totalResults === 1
        ? `${res.totalResults} movie.`
        : `${res.totalResults} movies. ${pageCounter}`;

    const messageEmbed = generateMessageEmbed()
      .setTitle(watchTitle)
      .setDescription(`Showing ${totalMoviesCounter}`);

    for (let i = 0; i < res.data.length; i += 1) {
      const obj = res.data[i];

      let movieData = `**${obj.data['Title']} (${obj.data['Year']})**`;

      if (obj.data['Poster'] && obj.data['Poster'] !== 'N/A') {
        movieData = `[${movieData}](${obj.data['Poster']})`;
      }

      messageEmbed.addField(`ID ${obj.data.imdbID}`, movieData);
    }

    await message.channel.send(messageEmbed);
  }
};
