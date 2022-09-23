'use strict';

const Service = require('egg').Service;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://10.168.1.100:27017/";


class MongodbService extends Service {
    async get_1_item_from_mongodb(db_name, db_num) {
        // 优先寻找没有read_num的文章来爬取
        const no_log_article = await this.get_items_from_mongodb(db_name, 'no');
        if(no_log_article.length > 0){
            return no_log_article[0];
        }else {
            const now_time_13 = new Date().getTime();
            const now_time = Math.floor(now_time_13 / 1000);
            const query_all = await this.get_items_from_mongodb(db_name, 'all');
            for (const ele of query_all) {
                let check_time = 0;
                if (ele.hasOwnProperty('check_time')) {
                    check_time = parseInt(ele.check_time);
                }
                let interval_check = now_time - check_time;
                const issue_date = new Date(ele.issue_date);
                const issue_date_int = Math.round(issue_date.getTime() / 1000);
                console.log("issue_date_int:", issue_date_int);
                let interval_issue_date_int = now_time - issue_date_int;
                console.log("interval_issue_date_int:", interval_issue_date_int);
                let is_need_crawl = await this.is_need_crawl(interval_issue_date_int, interval_check, db_num);
                console.log("is_need_crawl:", is_need_crawl)
                if (is_need_crawl === true) {
                    console.log('CRAWL!');
                    console.log(ele.title);
                    console.log(ele.name);
                    console.log(ele.issue_date);
                    return ele;
                } else {
                    console.log('No Need Crawl!');
                    console.log(ele.title);
                    console.log(ele.name);
                    console.log(ele.issue_date);
                }
            }
        }
        // 如果所有文章都无需爬取，则返回null
        return null;
    }


    // 核心逻辑为距离爬取最近的文章，抓取阅读量的密度越高
    async get_items_from_mongodb(db, type) {
        let conn = null;
        //默认只爬取2天之内的数据
        const day = 2;
        const time_limit = parseInt(new Date().getTime() / 1000) - parseInt(day * 24 * 60 * 60);
        conn = await MongoClient.connect(url);
        const url_db = conn.db("weixin").collection(db);
        console.log("get_items_from_mongodb数据库已连接");
        const my_query = {
            'add_time': {$gt: time_limit}
        }
        const my_query_no_logs = {
            'add_time': {$gt: time_limit},
            'check_time': null
        }
        const my_sort = {
            'check_time': 1
        }
        const my_sort_no_logs = {
            'add_time': -1
        }
        if(type == 'no'){
            console.log('return no logs')
            // 理论上说，所有没有阅读数的文章均需要爬取阅读数，因此只需任取一个即可
            const result_no_logs = await url_db.find(my_query_no_logs).sort(my_sort_no_logs).limit(1).toArray();
            conn.close();
            return result_no_logs;
        }else{
            console.log('return all')
            // 已经有阅读数的文章多取几个，以免没有需要爬取阅读数的文章
            const result_all = await url_db.find(my_query).sort(my_sort).limit(20).toArray();
            conn.close();
            return result_all;
        }
    }

    // 判断是否需要爬取
    async is_need_crawl(interval_issue, interval_check, db) {
        // 爬取逻辑矩阵
        // 省级6小时之内的文章，每小时爬1次；6-12小时每2小时爬1次；12-24小时每4小时爬一次；24-48小时每8小时爬一次；48小时以上的不再爬取阅读数
        // 市级6小时之内的文章，每2小时爬1次；6-12小时每3小时爬1次；12-24小时每6小时爬一次；24-48小时每12小时爬一次；48小时以上的不再爬取阅读数
        // 县级6小时之内的文章，每3小时爬1次；6-12小时每4小时爬1次；12-24小时每8小时爬一次；24-48小时每18小时爬一次；48小时以上的不再爬取阅读数
        const logic_object = [
            [3600, 7200, 14400, 28800],
            [7200, 10800, 21600, 43200],
            [10800, 14400, 28800, 64800]
        ];

        const step1 = 6 * 60 * 60;
        const step2 = 12 * 60 * 60;
        const step3 = 24 * 60 * 60;
        const step4 = 48 * 60 * 60;

        let interval = 0;
        // 计算应该间隔的时间
        if (interval_issue < step1) {
            interval = logic_object[db][0];
        } else if (interval_issue < step2) {
            interval = logic_object[db][1];
        } else if (interval_issue < step3) {
            interval = logic_object[db][2];
        } else if (interval_issue < step4) {
            interval = logic_object[db][3];
        } else {
            console.log('time_out!');
            // 超过48小时变化很小，就不再爬取阅读数了
            return false;
        }
        console.log('interval',interval)
        //如果间隔时间超过了规定时间，则开始爬取
        if (interval_check > interval) {
            return true
        }
        return false;
    }
}

module.exports = MongodbService;