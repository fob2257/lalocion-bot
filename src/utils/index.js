const Discord = require('discord.js');
const randomHex = require('random-hex-color');
const chalk = require('chalk');
const { omdbAPI } = require('./request');
const { refs } = require('../firebase');

const botPrefix = process.env.BOT_PREFIX;

const logger = {
  server: (message) => console.log(chalk.green(message)),
  error: (message) => console.log(chalk.red(message))
};

const getCommandAndArgs = (message) => {
  let argsString = message.content
    .slice(botPrefix.length)
    .trim()
    .replace(/\s+/g, ' ');

  const command = argsString.split(' ').shift().toLowerCase();
  argsString = argsString.slice(command.length).trim();

  const regex = /"([^]*)"/g;
  const matches = regex.test(argsString);

  const args = !matches
    ? argsString.split(' ')
    : argsString
        .split(regex)
        .filter((val) => val.length)
        .map((val, i) =>
          i === 0 ? val.replace(/("|')+/g, '').trim() : val.trim().split(' ')
        )
        .flat();

  return { command, args };
};

const isImdbID = (val = '') =>
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

const generateMessageEmbed = () =>
  new Discord.MessageEmbed().setColor(randomHex());

const getMovie = async (id) => {
  const dataSnapshot = await refs.movies.child(id).once('value');

  return dataSnapshot.val();
};

const addMovie = async (id, movie, user) => {
  const movieRef = refs.movies.child(id);
  const movieFound = await getMovie(id);

  if (movieFound) {
    await movieRef.update({
      watched: false,
      updatedAt: new Date().toISOString()
    });
  } else {
    await movieRef.set({
      data: movie,
      addedBy: user,
      watched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return movieRef;
};

module.exports = {
  getCommandAndArgs,
  logger,
  searchOneByIdOrTitle,
  searchByTitle,
  isImdbID,
  isValidYear,
  generateMessageEmbed,
  getMovie,
  addMovie
};
