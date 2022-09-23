'use strict';

const Service = require('egg').Service;

class DbService extends Service {
    async select_all_uin() {
        const result = await this.app.mysql.select('admin_weixin_uin');
        return result;
    }

    async get_usable_uins(){
        const uins = await this.select_all_uin();

        let i = 0;
        for(const uin of uins){
            console.log(uin);
            // 找出已经超时的uin
            const outline_uins = await this.app.mysql.select('admin_outline_uin', {
                where: {'uin': uin.uin, 'status': 1}
            })
            if(outline_uins.length < 1){
                // 如果该uin没有超时，则判断该uin有没有被微信官方判定为频繁访问
                const res = await this.check_frequent_log_by_uin(uin.uin);
                if(res.length < 1){
                    i = i + 1;
                }
            }
        }
        console.log('可用的微信uin数量为：',i);
        return i;
    }

    async check_frequent_log_by_uin(uin) {
        const now_time = parseInt(new Date().getTime() / 1000);
        const interval_time = 24 * 60 * 60;
        const frequent_time_pass = now_time - interval_time;
        console.log("frequent_time_pass", frequent_time_pass);
        const sql_str = 'SELECT * FROM admin_frequent_uin where frequent_time > ' + frequent_time_pass + ' and uin = "' + uin + '";';
        console.log("sql_str", sql_str);
        const res = await this.app.mysql.query(sql_str);
        console.log(res);
        return res;
    }

    async can_i_crawl(){
        // const result = await get_usable_uins();
        // const uins_all_num = result.total;
        // const usable_uins_num = result.usable;
        const usable_uins_num = await this.get_usable_uins();
        console.log('USABLE UIN NUMBER:', usable_uins_num);
        const uin_slow_limit = this.app.config.UinSlowLimit;
        const uin_stop_limit = this.app.config.UinStopLimit;
        if(usable_uins_num <= uin_stop_limit){
            // 当可用微信数降至2时，只保留疫情监控系统，不再爬取本地公众号
            return false;
        }else if(usable_uins_num <= uin_slow_limit){
            // 当可用微信数降至3时，只保留一半的本地公众号爬取能力
            const res = await get_result_by_random(50);
            return res;
        }else{
            // 如果可用微信数大于3，则系统正常运行
            return true;
        }
    }

    // 按从0到100的随机数，返回是否为true
    async ranget_result_by_random(rate_limt) {
        //生成一个0-100的随机数
        const num = Math.floor(Math.random() * 100);
        if(num > rate_limt){
            return true;
        }else{
            return false;
        }
    }
}

module.exports = DbService;