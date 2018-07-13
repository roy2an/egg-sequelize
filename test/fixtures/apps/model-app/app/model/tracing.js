'use strict';

const assert = require('assert');

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;
  const Tracing = app.models.ga.define('tracing', {
    user_id: INTEGER,
    name: STRING(30),
  });

  Tracing.associate = function() {
    assert.ok(app.models.ga.Tracing);
  };

  return Tracing;
};
