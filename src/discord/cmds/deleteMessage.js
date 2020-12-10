module.exports = {
  actions: ['delete'],
  handler: async (message, { args }) => {
    let limit = Number.parseInt(args[0]);

    if (!limit) limit = 1;
    limit += 1;

    await message.channel.messages
      .fetch({ limit })
      .then((messages) =>
        messages.map(async (message) => await message.delete())
      );
  }
};
