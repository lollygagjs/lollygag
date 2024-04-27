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
const sharp_1 = __importDefault(require("sharp"));
const handlers = {
    'image/gif': (img, { gifOptions }) => {
        img.gif(gifOptions);
    },
    'image/png': (img, { pngOptions }, quality) => {
        var _a;
        const q = (_a = pngOptions === null || pngOptions === void 0 ? void 0 : pngOptions.quality) !== null && _a !== void 0 ? _a : quality;
        img.png(Object.assign({ quality: q }, pngOptions));
    },
    'image/jpeg': (img, { jpegOptions }, quality) => {
        var _a;
        const q = (_a = jpegOptions === null || jpegOptions === void 0 ? void 0 : jpegOptions.quality) !== null && _a !== void 0 ? _a : quality;
        img.jpeg(Object.assign({ quality: q }, jpegOptions));
    },
};
function generateImage(path, fullImgPath, mimetype, options, quality, resizeParams) {
    return __awaiter(this, void 0, void 0, function* () {
        const img = (0, sharp_1.default)(path);
        handlers[mimetype](img, options, quality);
        img.resize(resizeParams === null || resizeParams === void 0 ? void 0 : resizeParams.width, resizeParams === null || resizeParams === void 0 ? void 0 : resizeParams.height, resizeParams === null || resizeParams === void 0 ? void 0 : resizeParams.options);
        yield img.toFile(fullImgPath);
    });
}
exports.default = generateImage;
