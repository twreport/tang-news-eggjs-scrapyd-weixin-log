const Subscription = require('egg').Subscription;

class WeixinLogCountyDriver extends Subscription {
    static get schedule() {
        return {
            cron: '0 0/3 7-23 * * ?',
            type: 'worker'
        };
    }
    async subscribe() {
        console.log("county_driver OK")
        await this.ctx.service.weixin.start('county', 2);
    }
}

module.exports = WeixinLogCountyDriver;