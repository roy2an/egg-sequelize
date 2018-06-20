'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const MODELS = Symbol('loadedModels');
const chalk = require('chalk');

Sequelize.prototype.log = function() {
  if (this.options.logging === false) { return; }
  const args = Array.prototype.slice.call(arguments);
  const sql = args[0].replace(/Executed \(.+?\):\s{0,1}/, '');
  this.options.logging.info('[model]', chalk.magenta(sql), `(${args[1]}ms)`);
};

module.exports = app => {
  const defaultConfig = {
    logging: app.logger,
    host: 'localhost',
    port: 3306,
    username: 'root',
    benchmark: true,
    define: {
      freezeTableName: false,
      underscored: true,
    },
  };

  app.Sequelize = Sequelize;

  let cfg = app.config.sequelize;
  if (app.config.sequelize.constructor !== Array) {
    cfg = [ cfg ];
  }

  Object.defineProperty(app, 'dbs', {
    value: [],
    writable: false,
  });

  for (let i = 0; i < cfg.length; i++) {
    const config = Object.assign(defaultConfig, cfg[i]);
    const sequelize = new Sequelize(config.database, config.username, config.password, config);

    app.dbs[i] = app.dbs[config.database] = sequelize;
  }

  // app.sequelize
  Object.defineProperty(app, 'model', {
    value: app.dbs[0],
    writable: false,
    configurable: false,
  });

  loadModel(app);

  app.beforeStart(function* () {
    for (let i = 0; i < cfg.length; i++) {
      yield app.dbs[i].authenticate();
    }
    // yield app.model.authenticate();
  });
};

function loadModel(app) {
  const modelDir = path.join(app.baseDir, 'app/model');
  app.loader.loadToApp(modelDir, MODELS, {
    inject: app,
    caseStyle: 'upper',
    ignore: 'index.js',
  });

  recursionModel(app[MODELS], '', app);
  recursionAssociate(app[MODELS]);
}

function recursionModel(values, ns, app) {
  for (const name of Object.keys(values)) {
    const klass = values[name];
    const tns = (ns ? ns + '_' : '') + name;
    if ('sequelize' in klass) {
      app.dbs[klass.sequelize.config.database][tns] = klass;
      // app.model[tns] = klass;
      if ('classMethods' in klass.options || 'instanceMethods' in klass.options) {
        app.logger.error(`${name} model has classMethods/instanceMethods, but it was removed supports in Sequelize V4.\
see: http://docs.sequelizejs.com/manual/tutorial/models-definition.html#expansion-of-models`);
      }
    } else {
      recursionModel(klass, tns, app);
    }
  }
}

function recursionAssociate(values) {
  for (const name of Object.keys(values)) {
    const klass = values[name];
    if ('sequelize' in klass) {
      if ('associate' in klass) { klass.associate(); }
    } else {
      recursionAssociate(klass);
    }
  }
}
