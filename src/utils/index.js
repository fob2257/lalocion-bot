const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const { omdbAPI } = require('./request');

const botPrefix = process.env.BOT_PREFIX;
const imagesDirPath = path.join(__dirname, '../../images/');

const logger = {
  server: (message) => console.log(chalk.green(message)),
  error: (message) => console.log(chalk.red(message))
};

const getCommandAndArgs = (message) => {
  const args = message.content.slice(botPrefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  return { command, args };
};

const writeFile = (dirPath, fileName, data, options) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  const joinedPath = path.join(dirPath, fileName);

  return new Promise((resolve, reject) =>
    fs.writeFile(joinedPath, data, options, (error) => {
      if (error) {
        return reject(error);
      }

      resolve(joinedPath);
    })
  );
};

const clipImage = async (imagePath, saveImage = true) => {
  const jimpImage = await Jimp.read(imagePath);
  const contentType = jimpImage._originalMime;
  const fileName = `${uuidv4()}.${contentType.split('/')[1]}`;
  const regex = /^data:([A-Za-z-+/]+);base64,(.+)$/;

  const newImage = await jimpImage
    .resize(135, 200)
    .quality(60)
    .getBase64Async(contentType)
    .then((value) =>
      Promise.resolve({
        base64: {
          value,
          matches: value.match(regex)
        }
      })
    );

  newImage.buffer = new Buffer.from(newImage.base64.matches[2], 'base64');

  newImage.path = saveImage
    ? await writeFile(imagesDirPath, fileName, newImage.base64.matches[2], {
        encoding: 'base64'
      })
    : null;

  return newImage;
};

const searchByTitle = async (obj) => {
  const { title, year, page = 1, type = 'movie' } = obj;

  const params = { s: title, type, page, y: year ? year : undefined };

  const res = await omdbAPI.request({ method: 'GET', params });
  const data = await Promise.all(
    res.data['Search'].map(async (obj) => {
      const newImage = await clipImage(obj['Poster'], false);

      return {
        ...obj,
        ['ClippedImage']: newImage
      };
    })
  );

  return { ...res, data };
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
