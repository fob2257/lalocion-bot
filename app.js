const Discord = require('discord.js');
const { getCommandAndArgs, logger } = require('./src/utils');
const commands = require('./src/discord/cmds');

const botToken = process.env.BOT_TOKEN;
const botPrefix = process.env.BOT_PREFIX;
const botChannel = process.env.BOT_CHANNEL_ID;
const client = new Discord.Client();

// messageUpdate
// messageReactionAdd
// messageReactionRemove
// messageDelete
// messageDeleteBulk
client.on('message', async (message) => {
  if (
    message.author.bot ||
    !message.content.startsWith(botPrefix) ||
    (botChannel && message.channel.name !== botChannel)
  ) {
    return;
  }

  const { command, args } = getCommandAndArgs(message);

  if (!commands[command]) return;

  try {
    const fn = await commands[command](message, { command, args }, client);

    if (fn) fn();
  } catch (error) {
    logger.error('Error on message listener');
    logger.error(`${command} ${args}`);
    console.error(error);

    await message.channel.send(
      new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An error has occured while executing your command.')
    );
  }
});

client.on('error', (error) => {
  logger.error('Error on discord client');
  console.error(error);
});

client.on('ready', () =>
  logger.server(`Bot ${client.user.username} is online!`)
);

client.login(botToken);
