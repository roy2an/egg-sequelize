'use strict';

const assert = require('assert');

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;
  const Tracing = app.dbs.ga.define('tracing', {
    user_id: INTEGER,
    name: STRING(30),
  });

  Tracing.associate = function() {
    assert.ok(app.dbs.ga.Tracing);
  };

  return Tracing;
};
