var fs = require('fs');
var jsonfile = require('jsonfile');
var gunzip = require('gunzip-file');
var download = require('download');
var tmpDirName = new Date().getTime().toString();
var tmpRawDataFullDirName = [__dirname, 'raw_data', tmpDirName].join('/');
var tmpDataFullDirName = [__dirname, 'data', tmpDirName].join('/');
var versionControlFile = [__dirname, 'v.json'].join('/');
var CONSTANTS = {
    CITY: {
        TAIPEI_CITY: {
            URL: 'https://tcgbusfs.blob.core.windows.net/blobbus/GetBusData.gz',
            FILENAME: 'taipei-city'
        },
        NEW_TAIPEI_CITY: {
            URL: 'https://tcgbusfs.blob.core.windows.net/ntpcbus/GetBusData.gz',
            FILENAME: 'new-taipei-city'
        }
    },
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

function processData(uri, filename) {
    return new Promise(function (finalResolve, finalReject) {
        console.log('start the process of bus data');
        console.log('downloading bus data');
        download(uri, tmpRawDataFullDirName, {
            filename: [filename, 'gz'].join('.')
        }).then(function () {
            console.log('decompressing bus gzip data');
            return new Promise(function (resolve, reject) {
                var src = [tmpRawDataFullDirName, [filename, 'gz'].join('.')].join('/');
                var dest = [tmpDataFullDirName, [filename, 'json'].join('.')].join('/');
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
        }).then(function (fullFilename) {
            'use strict';
            return new Promise(function (resolve, reject) {
                jsonfile.readFile(fullFilename, function (err, obj) {
                    if (!err) {
                        resolve(obj)
                    } else {
                        reject(err);
                    }
                });
            });
        }).then(function (busData) {
            console.log(['The process of ', filename, '\'s data has been finished.'].join());
            finalResolve();
        }).catch(function (err) {
            console.error(err);
            finalReject();
        });
    });
}

Promise.all([
    processData(CONSTANTS.CITY.TAIPEI_CITY.URL, CONSTANTS.CITY.TAIPEI_CITY.FILENAME),
    processData(CONSTANTS.CITY.NEW_TAIPEI_CITY.URL, CONSTANTS.CITY.NEW_TAIPEI_CITY.FILENAME)
]).then(function () {
    'use strict';
    return new Promise(function (resolve, reject) {
        jsonfile.writeFile(versionControlFile, {v: tmpDirName}, function (err) {
            if (!err) {
                resolve();
            } else {
                reject(err);
            }
        });
    });
}).then(function () {
    console.log('All processes are completed.');
});