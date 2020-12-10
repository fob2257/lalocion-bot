module.exports = {
  actions: ['ping', 'pong'],
  handler: (message, { command }) => {
    const reply = command === 'ping' ? 'Pong' : 'Ping';
    const timeTaken = Date.now() - message.createdTimestamp;

    message.reply(`${reply}! This message had a latency of ${timeTaken}ms.`);
  }
};
