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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.images = void 0;
const __1 = require("../..");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const generalFilename_1 = __importDefault(require("./helpers/generalFilename"));
const processImages_1 = __importDefault(require("./helpers/processImages"));
const deleteStaleImages_1 = __importDefault(require("./helpers/deleteStaleImages"));
const validMimetypes = ['image/gif', 'image/png', 'image/jpeg'];
function images(options) {
    return function imagesWorker(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const { gifOptions, pngOptions, jpegOptions, sizes } = options !== null && options !== void 0 ? options : {};
            const metaFile = '.images/meta.json';
            if (!(0, fs_1.existsSync)('.images/'))
                (0, fs_1.mkdirSync)('.images');
            if (!(0, fs_1.existsSync)(metaFile))
                (0, fs_1.writeFileSync)(metaFile, '{}');
            const metaFileText = (0, fs_1.readFileSync)(metaFile, {
                encoding: 'utf-8',
            });
            const oldMeta = JSON.parse(metaFileText.length
                ? (0, fs_1.readFileSync)(metaFile, { encoding: 'utf-8' })
                : '{}');
            const meta = {};
            const promises = files.map((f) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
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
                const fullImgPath = (0, generalFilename_1.default)(originalFilePath);
                const fullImgObj = {
                    full: {
                        path: fullImgPath,
                        quality,
                    },
                };
                const desired = [fullImgPath];
                const sizesObj = Object.keys(sizes !== null && sizes !== void 0 ? sizes : {}).reduce((size, key) => {
                    const sizePath = (0, generalFilename_1.default)(originalFilePath, key);
                    desired.push(sizePath);
                    // eslint-disable-next-line no-param-reassign
                    size[key] = {
                        path: sizePath,
                        width: (sizes !== null && sizes !== void 0 ? sizes : {})[key].width,
                        height: (sizes !== null && sizes !== void 0 ? sizes : {})[key].height,
                        options: (sizes !== null && sizes !== void 0 ? sizes : {})[key].options,
                        quality,
                    };
                    return size;
                }, {});
                meta[originalFilePath] = {
                    birthtimeMs: file.stats.birthtimeMs,
                    desired,
                    generated: Object.assign(Object.assign({}, fullImgObj), sizesObj),
                };
                const oldFileMeta = oldMeta[originalFilePath];
                const previouslyProcessed = oldFileMeta
                    && new Date(oldMeta[originalFilePath].birthtimeMs)
                        >= new Date(file.stats.birthtimeMs);
                const newFiles = yield (0, processImages_1.default)({
                    fileCopy: (0, __1.deepCopy)(file),
                    originalFilePath,
                    fullImgPath,
                    fileMimetype,
                    sizesObj,
                    quality,
                    oldFileMeta,
                    handlerOptions: { gifOptions, pngOptions, jpegOptions },
                    previouslyProcessed,
                });
                file.path = fullImgPath;
                files.push(...newFiles);
                console.log(`Processing ${originalFilePath}... done!`);
            }));
            yield Promise.all(promises);
            (0, deleteStaleImages_1.default)(meta, oldMeta);
            yield (0, promises_1.writeFile)(metaFile, JSON.stringify(meta, null, 2));
        });
    };
}
exports.images = images;
exports.default = images;
