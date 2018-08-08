'use strict';

const path = require('path');
const is = require('is-type-of');
const Sequelize = require('sequelize');
const MODELS = Symbol('loadedModels');
const EXTMODELS = Symbol('loadedExtModels');
const AUTH_RETRIES = Symbol('authenticateRetries');
const chalk = require('chalk');
const sleep = require('mz-modules/sleep');

Sequelize.prototype.log = function() {
  if (this.options.logging === false) { return; }
  const args = Array.prototype.slice.call(arguments);
  const sql = args[0].replace(/Executed \(.+?\):\s{0,1}/, '');
  this.options.logging.info('[model]', chalk.magenta(sql), `(${args[1]}ms)`);
};

module.exports = app => {
  app.Sequelize = Sequelize;
  let cfg = app.config.sequelize;
  if (is.asyncFunction(app.config.sequelize)) {
    app.config.sequelize().then(config => {
      installConfig(app, config, true);
    });

    return;
  } else if (is.function(app.config.sequelize)) {
    cfg = app.config.sequelize();
  }
  installConfig(app, cfg);
};

function installConfig(app, cfg) {
  if (!is.array(cfg)) {
    cfg = [ cfg ];
  }

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
    extDirs: [],
  };

  Object.defineProperty(app, 'models', {
    value: [],
    writable: false,
  });

  for (let i = 0; i < cfg.length; i++) {
    const config = Object.assign(defaultConfig, cfg[i]);
    const sequelize = new Sequelize(config.database, config.username, config.password, config);

    app.models[i] = app.models[config.database] = sequelize;
  }

  // app.sequelize
  Object.defineProperty(app, 'model', {
    value: app.models[0],
    writable: false,
    configurable: false,
  });

  loadModel(app);

  if (arguments.length <= 2) {
    app.beforeStart(function* () {
      for (let i = 0; i < cfg.length; i++) {
        // yield app.models[i].authenticate();
        yield authenticate(app, i);
      }

      app.emit('authenticated');
    });
  } else {
    for (let i = 0; i < cfg.length; i++) {
      app.models[i].authenticate();
    }

    app.emit('authenticated');
  }
}

/**
 * Authenticate to test Database connection.
 *
 * This method will retry 3 times when database connect fail in temporary, to avoid Egg start failed.
 * @param {Application} app instance of Egg Application
 * @param {Number} i index of models
 */
function* authenticate(app, i) {
  app.models[i][AUTH_RETRIES] = app.models[i][AUTH_RETRIES] || 0;
  try {
    yield app.models[i].authenticate();
  } catch (e) {
    if (e.name !== 'SequelizeConnectionRefusedError') throw e;
    if (app.models[i][AUTH_RETRIES] >= 3) throw e;

    // sleep 2s to retry, max 3 times
    app.models[i][AUTH_RETRIES] += 1;
    app.logger.warn(`Sequelize Error: ${e.message}, sleep 2 seconds to retry...`);
    yield sleep(2000);
    yield authenticate(app, i);
  }
}

function loadModel(app) {
  const modelDir = path.join(app.baseDir, 'app/model');
  app.loader.loadToApp(modelDir, MODELS, {
    inject: app,
    caseStyle: 'upper',
    ignore: 'index.js',
  });

  const { extDirs } = app.config.sequelize;
  for (const dir of extDirs) {
    console.log(path.join(dir, 'app/model'));
    app.loader.loadToApp(path.join(dir, 'app/model'), EXTMODELS, {
      inject: app,
      caseStyle: 'upper',
      ignore: 'index.js',
    });
  }

  recursionModel(app[MODELS], '', app);
  recursionAssociate(app[MODELS]);

  recursionModel(app[EXTMODELS], '', app);
  recursionAssociate(app[EXTMODELS]);
}

function recursionModel(values, ns, app) {
  for (const name of Object.keys(values)) {
    const klass = values[name];
    const tns = (ns ? ns + '_' : '') + name;
    if ('sequelize' in klass) {
      app.models[klass.sequelize.config.database][tns] = klass;
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
