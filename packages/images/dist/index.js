"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
const core_1 = require("@lollygag/core");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const generalFilename_1 = require("./helpers/generalFilename");
const processImages_1 = require("./helpers/processImages");
const validMimetypes = ['image/gif', 'image/png', 'image/jpeg'];
function images(options) {
    return function imagesWorker(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const { gifOptions, pngOptions, jpegOptions, widths } = options !== null && options !== void 0 ? options : {};
            const metaFile = '.images/meta.json';
            if (!(0, fs_1.existsSync)('.images/'))
                (0, fs_1.mkdirSync)('.images');
            if (!(0, fs_1.existsSync)(metaFile))
                (0, fs_1.writeFileSync)(metaFile, '{}');
            const meta = {};
            const promises = files.map((f) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const file = f;
                if (!file.stats)
                    return;
                const fileMimetype = file.mimetype;
                if (!validMimetypes.includes(fileMimetype))
                    return;
                const originalFilePath = file.path;
                console.log(`Processing ${originalFilePath}...`);
                let quality;
                if (fileMimetype === 'image/png') {
                    quality = (_a = pngOptions === null || pngOptions === void 0 ? void 0 : pngOptions.quality) !== null && _a !== void 0 ? _a : 80;
                }
                else if (fileMimetype === 'image/jpeg') {
                    quality = (_b = jpegOptions === null || jpegOptions === void 0 ? void 0 : jpegOptions.quality) !== null && _b !== void 0 ? _b : 80;
                }
                const fullImgPath = (0, generalFilename_1.generateFilename)(originalFilePath, 'full', quality);
                const widthsPaths = (_c = widths === null || widths === void 0 ? void 0 : widths.map((width) => (0, generalFilename_1.generateFilename)(originalFilePath, width, quality))) !== null && _c !== void 0 ? _c : [];
                meta[originalFilePath] = {
                    birthtimeMs: file.stats.birthtimeMs,
                    generated: [fullImgPath, ...widthsPaths],
                };
                let newFiles = [];
                const fileCopy = (0, core_1.deepCopy)(file);
                const processImagesArgs = {
                    fileCopy,
                    originalFilePath,
                    fullImgPath,
                    fileMimetype,
                    widthsPaths,
                    quality,
                    handlerOptions: { gifOptions, pngOptions, jpegOptions },
                };
                const metaFileText = (0, fs_1.readFileSync)(metaFile, {
                    encoding: 'utf-8',
                });
                const oldMeta = JSON.parse(metaFileText.length
                    ? (0, fs_1.readFileSync)(metaFile, { encoding: 'utf-8' })
                    : '{}');
                if (
                // file has been processed previously
                oldMeta[originalFilePath]
                    && new Date(oldMeta[originalFilePath].birthtimeMs)
                        >= new Date(file.stats.birthtimeMs)) {
                    newFiles = yield (0, processImages_1.processImages)(Object.assign(Object.assign({}, processImagesArgs), { previouslyProcessed: true }));
                }
                else {
                    newFiles = yield (0, processImages_1.processImages)(processImagesArgs);
                }
                file.path = fullImgPath;
                files.push(...newFiles);
                console.log(`Processing ${originalFilePath}... done!`);
            }));
            yield Promise.all(promises);
            yield (0, promises_1.writeFile)(metaFile, JSON.stringify(meta, null, 2));
        });
    };
}
exports.default = images;
