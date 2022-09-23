const Subscription = require('egg').Subscription;

class WeixinLogProvinceDriver extends Subscription {
    static get schedule() {
        return {
            cron: '0/30 * * * * ?',
            type: 'worker'
        };
    }
    async subscribe() {
        console.log("province_driver OK")
        await this.ctx.service.weixin.start('province', 0);
    }
}

module.exports = WeixinLogProvinceDriver;