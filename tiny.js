const fs = require('fs');
const path = require('path');
const tinify = require('tinify');

module.exports = {
    initTiny(key) {
        tinify.key = key;
    },

    async validateTinyKey() {
        return new Promise((resolve) => {
            tinify.validate((err) => {
                if(err) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    },

    async compress(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, sourceData) => {
                if (err) {
                    reject(err);
                    return;
                }
                tinify.fromBuffer(sourceData).toBuffer((err, resultData) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(resultData);
                });
            });
        });
    },

    async compress2(filePath) {
        const dir = path.dirname(filePath);
        const ext = path.extname(filePath);
        const destFilePath = path.join(dir, `tmp_${Date.now()}${ext}`);
        const source = tinify.fromFile(filePath);
        await source.toFile(destFilePath);
        return destFilePath;
    },

    removeFileFromDisk(filePath) {
        try {
            fs.unlinkSync(filePath);
        } catch(e) {}
    }
}