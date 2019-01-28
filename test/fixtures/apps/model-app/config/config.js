'use strict';

// const getConfig = function(time) {
//   return new Promise(function(resolve) {
//     setTimeout(function() {
//       resolve(
//         [{
//           port: '3306',
//           host: '127.0.0.1',
//           username: 'root',
//           password: '',
//           database: 'test',
//           dialect: 'mysql',
//           pool: {
//             max: 5,
//             min: 0,
//             idle: 10000,
//           }
//         }, {
//           port: '3306',
//           host: '127.0.0.1',
//           username: 'root',
//           password: '',
//           database: 'ga',
//           dialect: 'mysql',
//           pool: {
//             max: 5,
//             min: 0,
//             idle: 10000,
//           }
//         }]
//       );
//     }, time);
//   });
// };

// exports.sequelize = async () => {
//   const data = await getConfig(3000);
//   return data;
// };


const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  config.sequelize = [{
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
    storage: 'db/test-foo.sqlite',
    timezone: '+08:01',
    extDirs: [ path.join(appInfo.baseDir, '../ext-app/') ],
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
    extDirs: [ path.join(appInfo.baseDir, '../ext-app2/') ],
  }];

  config.keys = '0jN4Fw7ZBjo4xtrLklDg4g==';

  return config;
};
