'use strict';

const assert = require('assert');

module.exports = app => {
  const { STRING } = app.Sequelize;
  const Fake = app.model.define('fake', {
    // user_id: INTEGER,
    name: STRING(30),
  });

  Fake.associate = function() {
    assert.ok(app.model.User);
    assert.ok(app.model.Fake);
    app.model.Fake.belongsTo(app.model.User, { as: 'user', foreignKey: 'user_id' });
  };

  return Fake;
};
