const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');
const { getCommandAndArgs, logger } = require('./src/utils');

const botToken = process.env.BOT_TOKEN;
const botPrefix = process.env.BOT_PREFIX;
const botChannel = process.env.BOT_CHANNEL_ID;

const client = new Discord.Client();
const cmdsDirPath = path.join(__dirname, 'src/discord/cmds');
const commands = {};

fs.readdir(cmdsDirPath, (error, files) => {
  if (error) {
    logger.error('Error on commands loader');
    return console.error(error);
  }

  files.forEach((file) => {
    if (!file.endsWith('.js')) return;

    const command = require(`${cmdsDirPath}/${file}`);
    for (var i = 0; i < command.actions.length; i += 1) {
      commands[command.actions[i].toLowerCase()] = command.handler;
    }
  });

  logger.server('Commands loaded!');
});

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

    return message.channel.send(
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
