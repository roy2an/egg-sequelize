'use strict';

const assert = require('assert');

module.exports = app => {
  const { STRING } = app.Sequelize;
  const JieDong = app.model.define('jiedong', {
    // user_id: INTEGER,
    name: STRING(30),
  });

  JieDong.associate = function() {
    assert.ok(app.model.User);
    assert.ok(app.model.Jiedong);
    app.model.Jiedong.belongsTo(app.model.User, { as: 'user', foreignKey: 'user_id' });
  };

  return JieDong;
};
