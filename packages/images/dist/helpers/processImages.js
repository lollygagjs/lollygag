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
const core_1 = require("@lollygag/core");
const fs_1 = require("fs");
const generateImage_1 = __importDefault(require("./generateImage"));
function processImages(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const newFiles = [];
        const { fileCopy, originalFilePath, fullImgPath, fileMimetype, sizesObj, quality, handlerOptions, oldMeta, previouslyProcessed = false, } = args;
        const oldSize = oldMeta[originalFilePath].generated;
        const fullCondition = !(0, fs_1.existsSync)(fullImgPath) || quality !== (oldSize !== null && oldSize !== void 0 ? oldSize : {}).full.quality;
        if (previouslyProcessed ? fullCondition : true) {
            yield (0, generateImage_1.default)(originalFilePath, fullImgPath, fileMimetype, handlerOptions, quality);
        }
        if (sizesObj) {
            yield Promise.all(Object.keys(sizesObj).map((size) => __awaiter(this, void 0, void 0, function* () {
                const sizePath = sizesObj[size].path;
                const sizeWidth = sizesObj[size].width;
                const sizeHeight = sizesObj[size].height;
                const sizeOptions = sizesObj[size].options;
                newFiles.push(Object.assign(Object.assign({}, fileCopy), { path: sizePath }));
                const sizesCondition = !(0, fs_1.existsSync)(sizePath)
                    || quality !== (oldSize !== null && oldSize !== void 0 ? oldSize : {})[size].quality
                    || sizeWidth !== (oldSize !== null && oldSize !== void 0 ? oldSize : {})[size].width
                    || sizeHeight !== (oldSize !== null && oldSize !== void 0 ? oldSize : {})[size].height
                    || !(0, core_1.deepEqual)(sizeOptions, (oldSize !== null && oldSize !== void 0 ? oldSize : {})[size].options);
                if (previouslyProcessed ? sizesCondition : true) {
                    yield (0, generateImage_1.default)(originalFilePath, sizePath, fileMimetype, handlerOptions, quality, {
                        width: sizeWidth,
                        height: sizeHeight,
                        options: sizeOptions,
                    });
                }
            })));
        }
        return newFiles;
    });
}
exports.default = processImages;
