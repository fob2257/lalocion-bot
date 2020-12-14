const setFetchMessages = (message) => (limit, id) =>
  message.channel.messages.fetch({ limit, before: id ? id : undefined });

module.exports = {
  actions: ['delete'],
  handler: async (message, { args }) => {
    const limit = 100;
    const fetchMessages = setFetchMessages(message);
    let total = (Number.parseInt(args[0]) || 1) + 1;

    if (total > limit) total = limit;

    const bulks = [total];
    if (args[0] === 'all') {
      bulks.shift();

      let currentId;
      let currentSize = 1;

      while (currentSize) {
        const res = await fetchMessages(limit, currentId);

        currentId = res.lastKey();
        currentSize = res.size;

        if (!currentId || !currentSize) break;

        bulks.push(currentSize);
      }
    }

    await Promise.all(bulks.map((val) => message.channel.bulkDelete(val)));
  }
};
