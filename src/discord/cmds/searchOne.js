const { searchOneByIdOrTitle } = require('../../utils');

module.exports = {
  actions: ['searchOne'],
  handler: () => {
    searchOneByIdOrTitle({ title: 'heat', year: 1995 });
  }
};
