const chalk = require('chalk');
const { omdbAPI } = require('./request');

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

const searchByTitle = async (obj) => {
  const { title, year, page = 1, type = 'movie' } = obj;

  const params = { s: title, type, page, y: year ? year : undefined };

  const res = await omdbAPI.request({ method: 'GET', params });

  const data = res.data['Search'];
  const totalResults = Number.parseInt(res.data['totalResults']);
  const totalPages = Math.ceil(Math.round(totalResults / data.length));

  return { ...res, data, totalResults, totalPages, page };
};

const searchOneByIdOrTitle = async (obj) => {
  const { id, title, year, type = 'movie', plot = 'short' } = obj;

  const params = {
    type,
    plot,
    i: id ? id : undefined,
    t: !id && title ? title : undefined,
    y: year ? year : undefined
  };

  const res = await omdbAPI.request({ method: 'GET', params });

  return { ...res };
};

module.exports = {
  getCommandAndArgs,
  logger,
  searchOneByIdOrTitle,
  searchByTitle
};
