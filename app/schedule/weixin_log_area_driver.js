const Subscription = require('egg').Subscription;

class WeixinLogAreaDriver extends Subscription {
    static get schedule() {
        return {
            cron: '0 0/1 7-23 * * ?',
            type: 'worker'
        };
    }
    async subscribe() {
        console.log("area_driver OK")
        await this.ctx.service.weixin.start('area', 1);
    }
}

module.exports = WeixinLogAreaDriver;