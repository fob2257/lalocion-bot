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

const isValidPage = (val = '') => /p[1-9]+/.test(val);

const isWatchedVal = (val = '') => /^(watched|w)([=](true|false))?$/.test(val);

const isValidYear = (val = '') => /^(19|20)\d{2}$/.test(val);

const isValidDate = (val = '') =>
  /^(0?[1-9]|[12]\d|3[01])[/](0?[1-9]|1[0-2])[/](19|20)\d{2}$/.test(val);

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

const getMovies = async (obj) => {
  const { page = 1, watched = false, startDate, endDate } = obj;

  let query = refs.movies.where('watched', '==', watched);

  if (startDate) query = query.where('updatedAt', '>=', startDate);
  if (endDate) query = query.where('updatedAt', '<=', endDate);

  query = query.orderBy('updatedAt', 'desc');

  const limit = 10;
  let totalResults = (await query.get()).size;
  const totalPages =
    Math.ceil((totalResults / limit) * Math.pow(10, 0)) / Math.pow(10, 0);

  const docSnapshot = await query
    .offset((page - 1) * limit)
    .limit(limit)
    .get();

  const data = docSnapshot.docs.map((doc) => doc.data());

  if (docSnapshot.empty) totalResults = 0;

  return {
    page,
    totalPages,
    totalResults,
    data
  };
};

const getMovie = async (id) => {
  const docSnapshot = await refs.movies.doc(id).get();

  return docSnapshot.data();
};

const addMovie = async (id, movie, user) => {
  const movieRef = refs.movies.doc(id);
  const docSnapshot = await movieRef.get();

  const obj = {
    watched: false,
    updatededBy: user,
    updatedAt: Date.now()
  };

  if (docSnapshot.exists) {
    await movieRef.update(obj);
  } else {
    await movieRef.set({
      data: movie,
      createdBy: user,
      createdAt: Date.now(),
      ...obj
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
  isValidPage,
  isWatchedVal,
  isValidYear,
  isValidDate,
  generateMessageEmbed,
  getMovies,
  getMovie,
  addMovie
};
