'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async testv() {
    const { ctx } = this;
    // await ctx.service.mongodb.get_items_from_mongodb('province');
    const res = await ctx.service.weixin.start('county', 2);
    ctx.body = res;
  }
}

module.exports = HomeController;
