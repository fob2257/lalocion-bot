const chalk = require('chalk');
const { omdbAPI } = require('./request');

const botPrefix = process.env.BOT_PREFIX;

const logger = {
  server: (message) => console.log(chalk.green(message)),
  error: (message) => console.log(chalk.red(message))
};

const getCommandAndArgs = (message) => {
  const argsString = message.content
    .slice(botPrefix.length)
    .replace(/\s+/g, ' ')
    .trim();

  const command = argsString.split(' ').shift().toLowerCase();
  let args = argsString.slice(command.length).trim();

  const regex = /"([^]*)"/g;
  const matches = regex.test(args);

  args = args.split(matches ? regex : ' ').reduce((curr, val) => {
    const arg = val
      .replace(/["|']+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return arg.length > 0 ? [...curr, arg] : curr;
  }, []);

  return { command, args };
};

const isImbdID = (val = '') =>
  /ev\d{7}\/\d{4}(-\d)?|(ch|co|ev|nm|tt)\d{7}/.test(val);

const isValidYear = (val = '') => /^(19|20)\d{2}$/.test(val);

const searchByTitle = (obj) => {
  const { title, year, page = 1, type = 'movie' } = obj;

  const params = { s: title, type, page, y: year ? year : undefined };

  const pagesObj = {
    totalResults: 0,
    totalPages: 0,
    page
  };

  return omdbAPI
    .request({ method: 'GET', params })
    .then((res) => {
      if (res.data['Error']) {
        return { ...pagesObj, error: res.data['Error'] };
      }

      const data = res.data['Search'];
      pagesObj.totalResults = Number.parseInt(res.data['totalResults']);
      pagesObj.totalPages =
        Math.ceil((pagesObj.totalResults / 10) * Math.pow(10, 0)) /
        Math.pow(10, 0);

      return { ...res, ...pagesObj, data };
    })
    .catch((error) => ({ error: error.message }));
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

  return omdbAPI
    .request({ method: 'GET', params })
    .then((res) => (res.data['Error'] ? { error: res.data['Error'] } : res))
    .catch((error) => ({ error: error.message }));
};

module.exports = {
  getCommandAndArgs,
  logger,
  searchOneByIdOrTitle,
  searchByTitle,
  isImbdID,
  isValidYear
};
