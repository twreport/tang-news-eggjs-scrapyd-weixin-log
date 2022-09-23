'use strict';

const Service = require('egg').Service;

class WeixinService extends Service {
    async start(db_name, db_num) {
        console.log('Start Spide!');
        // 查看uin的情况，如果能够爬取再爬取
        const result = await this.service.db.can_i_crawl();
        console.log('CAN I CRAWL:')
        console.log(result)
        if(result === true){
            await this.weixin_mongo_driver(db_name, db_num)
        }else{
            console.log('No Usable UIN!!!');
        }
    }

    async crawl_log(_id, db) {
        const scrapyd_log_url = this.app.config.ScrapydLogUrl;
        // 拼接curl地址
        const url = scrapyd_log_url + "schedule.json";

        const data = {
            'project': 'weixin_log',
            'spider': 'weixin',
            '_id': _id,
            'db': db
        }
        console.log(data)
        const result = await this.ctx.curl(
            url, {
                method: 'POST',
                data: data,
                dataType: 'json'
            }
        );
        console.log(result)
    }


    async weixin_mongo_driver(db_name, db_num) {
        const query = await this.service.mongodb.get_1_item_from_mongodb(db_name, db_num);
        if(query != null){
            await this.crawl_log(query._id.toString(), db_name);
        }
        return false;
    }

}

module.exports = WeixinService;