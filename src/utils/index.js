const chalk = require('chalk');

const botPrefix = process.env.BOT_PREFIX;

const logger = {
  server: (message) => console.log(chalk.green(message)),
  error: (message) => console.log(chalk.red(message))
};

const getCommandAndArgs = (message) => {
  const args = message.content.slice(botPrefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  return { command, args };
};

module.exports = { getCommandAndArgs, logger };
