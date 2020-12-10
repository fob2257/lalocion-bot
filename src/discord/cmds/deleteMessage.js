module.exports = {
  actions: ['delete'],
  handler: async (message, { args }) => {
    const limit = args[0] || 2;

    await message.channel.messages
      .fetch({ limit })
      .then((messages) =>
        messages.map(async (message) => await message.delete())
      );
  }
};
