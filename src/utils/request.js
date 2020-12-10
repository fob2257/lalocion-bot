const axios = require('axios').default;

const omdbToken = process.env.OMDB_API_TOKEN;
const tmdbToken = process.env.TMDB_API_KEY;

const request = (baseURL) => (options) =>
  axios
    .request({ baseURL, responseType: 'json', ...options })
    .then((response) => (response ? response : null));

const omdbAPI = {
  request: request(`http://www.omdbapi.com/?apikey=${omdbToken}`)
};
// WIP
const tmdbAPI = {
  genresRequest: request(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbToken}`
  ),
  tmdbAPIGenresRequest: request(
    `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbToken}`
  )
};

module.exports = { omdbAPI, tmdbAPI };
