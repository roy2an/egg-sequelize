'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const request = require('supertest');

describe('test/plugin.test.js', () => {
  let app;

  before(() => {
    app = mm.app({
      baseDir: 'apps/model-app',
    });
    return app.ready();
  });
  before(() => app.model.sync({ force: true }));
  // before(() => app.models.ga.sync({ force: true }));

  after(mm.restore);

  describe('Base', () => {
    it('sequelize init success', () => {
      assert(app.model);
    });

    it('ctx model property getter', () => {
      const ctx = app.mockContext();
      assert.ok(ctx.model);
      assert.ok(ctx.model.Administrator);
      assert.ok(ctx.model.Subfolder_Monkey);
      assert.ok(ctx.model.Subfolder_Person);
      // assert.ok(ctx.models.ga.Tracing);
    });

    it('app model property getter', () => {
      assert.ok(app.model);
      assert.ok(app.model.Administrator);
      assert.ok(app.model.Subfolder_Monkey);
      assert.ok(app.model.Subfolder_Person);
      // assert.ok(app.models.ga.Tracing);
    });

    it('model not load non Sequelize files', function* () {
      assert(!('Other' in app.model));

      const ctx = app.mockContext();
      assert(!('Other' in ctx.model));
    });

    it('has right tableName', () => {
      assert(app.model.Subfolder_Person.tableName === 'people');
      assert(app.model.Administrator.tableName === 'users');
      assert(app.model.Subfolder_Monkey.tableName === 'the_monkeys');
    });
  });

  describe('Database options', () => {
    let config;

    before(() => {
      config = app.model.options;
    });

    it('should work with default config', function* () {
      assert(config.define.freezeTableName === false);
      assert(config.port === '3306');
      assert(config.username === 'root');
      assert(config.password === '');
      assert(config.logging !== false);
      assert(config.benchmark === true);
    });

    it('should work with fixture configs', function* () {
      assert(config.dialect === 'mysql');
      assert(config.host === '127.0.0.1');
      assert(config.pool.idle === 10000);
      assert(config.timezone === '+08:01');
      assert(config.storage === 'db/test-foo.sqlite');
    });
  });

  describe('Test model', () => {
    it('User.test method work', function* () {
      yield app.model.Administrator.test();
    });

    it('should work timestramp', function* () {
      const user = yield app.model.Administrator.create({ name: 'huacnlee' });
      assert(user.isNewRecord === false);
      assert(user.name === 'huacnlee');
      assert(user.created_at !== null);
      assert(user.updated_at !== null);
    });
  });

  describe('Test controller', () => {
    it('should get data from create', function* () {
      app.mockCsrf();

      yield request(app.callback())
        .post('/users')
        .send({
          name: 'popomore',
        });
      const user = yield app.model.Administrator.findOne({
        where: { name: 'popomore' },
      });
      assert.ok(user);
      assert(user.name === 'popomore');
      assert(user.isNewRecord === false);
      const res = yield request(app.callback())
        .get(`/users/${user.id}`);
      assert(res.status === 200);
      assert(res.body.name === 'popomore');
    });
  });

  describe('Associate', () => {

    it('ctx model associate init success', () => {
      const ctx = app.mockContext();
      assert.ok(ctx.model);
      assert.ok(ctx.model.Administrator);
      assert.ok(ctx.model.Administrator.prototype.hasPosts);
      assert.ok(ctx.model.Post);
    });

  });

});

