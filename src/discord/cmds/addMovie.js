const {
  searchOneByIdOrTitle,
  isImdbID,
  isValidYear,
  generateMessageEmbed,
  addMovie
} = require('../../utils');

module.exports = {
  actions: ['addMovie', 'add'],
  handler: async (message, { args }) => {
    if (args.length === 0 || args[0].length < 3) return;

    const maxArgs = 2;
    const params = [...args].slice(0, maxArgs).reduce((obj, val, i) => {
      if (i === 0) {
        const matches = isImdbID(val);

        return matches ? { ...obj, id: val } : { ...obj, title: val };
      }

      return isValidYear(val) ? { ...obj, year: val } : { ...obj };
    }, {});

    const res = await searchOneByIdOrTitle(params);

    if (!res.data || res.error) {
      return await message.channel.send(
        generateMessageEmbed()
          .setTitle(`Lalo searched for \`${args[0]}\``)
          .setDescription('Got no results :disappointed_relieved:')
      );
    }

    const { id, username, discriminator } = message.author;

    await addMovie(res.data.imdbID, res.data, {
      id,
      username,
      discriminator,
      avatar: message.author.avatarURL()
    });

    await message.channel.send(
      `Added to the list: ${res.data['Title']} (${res.data['Year']}) ID ${res.data['imdbID']}`
    );
  }
};
