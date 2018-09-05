'use strict';

module.exports = app => {
  return class UsersController extends app.Controller {
    * show() {
      const user = yield this.ctx.model.Administrator.findById(this.ctx.params.id);
      this.ctx.body = user;
    }

    * create() {
      yield app.model.Administrator.create({
        name: this.ctx.request.body.name,
      });
    }
  };
};
