'use strict';

module.exports = {
  get model() {
    return this.app.model;
  },
  get dbs() {
    return this.app.dbs;
  },
};
