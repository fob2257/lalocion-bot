const {
  searchOneByIdOrTitle,
  isImdbID,
  isValidYear,
  generateMessageEmbed
} = require('../../utils');

module.exports = {
  actions: ['searchOne', 'so'],
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

    const messageEmbed = generateMessageEmbed();

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
        ['Genre', 'Rated', 'Director', 'Writer', 'Actors', 'Released'].map(
          (key, i) => ({
            name: key,
            value: res.data[key],
            inline: i <= 1
          })
        )
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

      messageEmbed.setFooter(`ID ${res.data.imdbID}`);
    }

    await message.channel.send(messageEmbed);
  }
};
