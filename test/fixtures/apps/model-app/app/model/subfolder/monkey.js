'use strict';

module.exports = app => {
  const { STRING, DATE } = app.Sequelize;
  const Monkey = app.model.define('monkey', {
    name: {
      type: STRING,
      allowNull: false,
    },
    // user_id: INTEGER,
    created_at: DATE,
    updated_at: DATE,
  }, {
    tableName: 'the_monkeys',

    classMethods: {
    },

    instanceMethods: {
    },
  });

  Monkey.findUser = function* () {
    return yield app.model.Administrator.find({ id: 1 });
  };

  return Monkey;
};
