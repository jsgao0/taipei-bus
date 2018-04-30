var fs = require('fs');
var jsonfile = require('jsonfile');
var gunzip = require('gunzip-file');
var download = require('download');
var tmpDirName = new Date().getTime().toString();
var tmpRawDataFullDirName = [__dirname, 'raw_data', tmpDirName].join('/');
var tmpDataFullDirName = [__dirname, 'data', tmpDirName].join('/');
var CONSTANTS = {
    CAR_TYPE: {
        NORMAL: 0, // 一般
        LOW_STAGE: 1, // 低底盤
        ACCIBILITY: 2, // 大復康巴士
        CIRCLE: 3 // 圓仔公車
    },
    DIRECTION: {
        GO: 0,
        BACK: 1
    },
    BUS_STATUS: {
        NORMAL: 0,
        ACCIDENT: 1,
        BROKEN: 2,
        TRAFFIC: 3,
        EMERGENCY: 4,
        FILL_UP: 5,
        OUT_OF_SERVICE: 99
    },
    DUTY_STATUS: {
        NORMAL: 0,
        STARTED: 1,
        FINISHED: 2
    }
};

console.log('start the process of bus data');
console.log('downloading bus data');
download('https://tcgbusfs.blob.core.windows.net/blobbus/GetBusData.gz', tmpRawDataFullDirName, {
    filename: 'taipei-city.gz'
}).then(function () {
    console.log('decompressing bus gzip data');
    return new Promise(function (resolve, reject) {
        var src = [tmpRawDataFullDirName, 'taipei-city.gz'].join('/');
        var dest = [tmpDataFullDirName, 'taipei-city.json'].join('/');
        if (!fs.existsSync(tmpDataFullDirName)) {
            fs.mkdirSync(tmpDataFullDirName);
        }
        try {
            gunzip(
                src,
                dest,
                function () {
                    resolve(dest);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}).then(function (filename) {
    'use strict';
    return new Promise(function (resolve, reject) {
        jsonfile.readFile(filename, function (err, obj) {
            if (!err) {
                resolve(obj)
            } else {
                reject(err);
            }
        });
    });
}).then(function (busData) {
    console.log(busData);
    console.log('done');
}).catch(function (err) {
    console.error(err);
});