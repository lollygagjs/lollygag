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
/* eslint-disable no-param-reassign */
const core_1 = require("@lollygag/core");
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
function generateFilename(path, id, quality) {
    const fileExt = (0, core_1.fullExtname)(path);
    const fileBasename = (0, path_1.basename)(path, fileExt);
    let fileName;
    if (quality)
        fileName = `${fileBasename}-${id}-q${quality}${fileExt}`;
    else
        fileName = `${fileBasename}-${id}${fileExt}`;
    const dir = (0, path_1.join)('.images', (0, path_1.dirname)(path));
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    return (0, path_1.join)(dir, fileName);
}
function generateWidths(img, widths, quality, file, files) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(widths.map((width) => __awaiter(this, void 0, void 0, function* () {
            const imgPath = generateFilename(file.path, width, quality);
            yield img.resize(width).toFile(imgPath);
            files.push(Object.assign(Object.assign({}, file), { path: imgPath }));
        })));
    });
}
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
            const promises = files.map((f) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const file = f;
                if (!file.mimetype.startsWith('image'))
                    return;
                const meta = JSON.parse((_a = (0, fs_1.readFileSync)(metaFile, { encoding: 'utf-8' })) !== null && _a !== void 0 ? _a : '{}');
                if (meta[file.path] && file.stats) {
                    if (new Date(meta[file.path].birthtimeMs)
                        >= new Date(file.stats.birthtimeMs)) {
                        return;
                    }
                }
                console.log(`Processing ${file.path}...`);
                const img = (0, sharp_1.default)(file.path);
                let quality = false;
                switch (file.mimetype) {
                    case 'image/gif':
                        img.gif(gifOptions);
                        break;
                    case 'image/png':
                        quality = (_b = pngOptions === null || pngOptions === void 0 ? void 0 : pngOptions.quality) !== null && _b !== void 0 ? _b : 100;
                        img.png(Object.assign({ quality }, pngOptions));
                        break;
                    case 'image/jpeg':
                        quality = (_c = jpegOptions === null || jpegOptions === void 0 ? void 0 : jpegOptions.quality) !== null && _c !== void 0 ? _c : 80;
                        img.jpeg(Object.assign({ quality }, jpegOptions));
                        break;
                    default:
                }
                const fullImgPath = generateFilename(file.path, 'full', quality);
                yield img.toFile(fullImgPath);
                if (widths) {
                    yield generateWidths(img, widths, quality, (0, core_1.deepCopy)(file), files);
                }
                file.path = fullImgPath;
                if (file.stats) {
                    meta[file.path] = {
                        birthtimeMs: file.stats.birthtimeMs,
                    };
                }
                console.log(`Processing ${file.path}... done!`);
                yield (0, promises_1.writeFile)(metaFile, JSON.stringify(meta, null, 2));
            }));
            yield Promise.all(promises);
            // TODO: temp
            console.log(files.filter((f) => !f.path.startsWith('files')));
        });
    };
}
exports.default = images;
