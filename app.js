const Discord = require('discord.js');
const { getCommandAndArgs, logger } = require('./src/utils');

const botToken = process.env.BOT_TOKEN;
const botPrefix = process.env.BOT_PREFIX;
const client = new Discord.Client();

client.on('message', async function messageListener(message) {
  if (message.author.bot || !message.content.startsWith(botPrefix)) return;

  const { command, args } = getCommandAndArgs(message);

  // message.author.id;
  // message.attachments.size;
  if (['ping', 'pong'].includes(command)) {
    const reply = command === 'ping' ? 'Pong' : 'Ping';
    const timeTaken = Date.now() - message.createdTimestamp;

    message.reply(`${reply}! This message had a latency of ${timeTaken}ms.`);
    return;
  }
});

client.on('error', (error) => {
  logger.error(error);
});

client.on('ready', () => {
  logger.server(`${client.user.username} is online!`);
});

client.login(botToken);
