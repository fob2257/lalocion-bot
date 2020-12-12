module.exports = {
  actions: ['delete'],
  handler: async (message, { args }) => {
    let limit = Number.parseInt(args[0]);

    if (!limit) limit = 1;
    limit += 1;

    if (limit > 100) limit = 100;

    await message.channel.bulkDelete(limit);
  }
};
