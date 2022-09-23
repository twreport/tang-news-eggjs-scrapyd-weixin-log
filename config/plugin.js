'use strict';

/** @type Egg.EggPlugin */
module.exports = {
    //mongodb
    mongoose: {
        enable: true,
        package: 'egg-mongoose',
    },
    mysql: {
        enable: true,
        package: 'egg-mysql',
    },
};
