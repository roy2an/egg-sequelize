'use strict';

const getConfig = function(time) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(
        [{
          port: '3306',
          host: '127.0.0.1',
          username: 'root',
          password: '',
          database: 'test',
          dialect: 'mysql',
          pool: {
            max: 5,
            min: 0,
            idle: 10000,
          },
          authenticated(sequelize) {
            sequelize.sync();
          },
        }, {
          port: '3306',
          host: '127.0.0.1',
          username: 'root',
          password: '',
          database: 'ga',
          dialect: 'mysql',
          pool: {
            max: 5,
            min: 0,
            idle: 10000,
          },
          authenticated(sequelize) {
            sequelize.sync();
          },
        }]
      );
    }, time);
  });
};

exports.sequelize = async () => {
  const data = await getConfig(3000);
  return data;
};

// exports.sequelize = [{
//             port: '3306',
//             host: '127.0.0.1',
//             username: 'root',
//             password: '',
//             database: 'test',
//             dialect: 'mysql',
//             pool: {
//               max: 5,
//               min: 0,
//               idle: 10000,
//             },
//           }, {
//             port: '3306',
//             host: '127.0.0.1',
//             username: 'root',
//             password: '',
//             database: 'ga',
//             dialect: 'mysql',
//             pool: {
//               max: 5,
//               min: 0,
//               idle: 10000,
//             },
//           }]

exports.keys = '0jN4Fw7ZBjo4xtrLklDg4g==';
