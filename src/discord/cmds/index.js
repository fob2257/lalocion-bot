const path = require('path');
const fs = require('fs');
const { logger } = require('../../utils');

const cmdsDirPath = path.join(__dirname);
const commands = {};

fs.readdir(cmdsDirPath, (error, files) => {
  if (error) {
    logger.error('Error on commands loader');
    return console.error(error);
  }

  files.forEach((file) => {
    if (!file.endsWith('.js') || file.includes('index')) return;

    const command = require(`${cmdsDirPath}/${file}`);
    for (var i = 0; i < command.actions.length; i += 1) {
      commands[command.actions[i].toLowerCase()] = command.handler;
    }
  });

  logger.server('Commands loaded!');
});

module.exports = commands;
