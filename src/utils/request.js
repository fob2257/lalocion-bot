const axios = require('axios').default;

const omdbToken = process.env.OMDB_API_TOKEN;

const request = (baseURL) => (options) =>
  axios
    .request({ baseURL, responseType: 'json', ...options })
    .then((response) => (response ? response : null));

const omdbAPI = {
  request: request(`http://www.omdbapi.com/?apikey=${omdbToken}`)
};

module.exports = { omdbAPI };
