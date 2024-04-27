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
const __1 = require("../../..");
const fs_1 = require("fs");
const generateImage_1 = __importDefault(require("./generateImage"));
function processImages(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const newFiles = [];
        const { fileCopy, originalFilePath, fullImgPath, fileMimetype, sizesObj, quality, handlerOptions, oldFileMeta, previouslyProcessed = false, } = args;
        const oldSizes = oldFileMeta === null || oldFileMeta === void 0 ? void 0 : oldFileMeta.generated;
        let fullCondition = true;
        if (previouslyProcessed) {
            fullCondition
                = !(0, fs_1.existsSync)(fullImgPath) || quality !== ((_a = oldSizes === null || oldSizes === void 0 ? void 0 : oldSizes.full) === null || _a === void 0 ? void 0 : _a.quality);
        }
        if (fullCondition) {
            yield (0, generateImage_1.default)(originalFilePath, fullImgPath, fileMimetype, handlerOptions, quality);
        }
        if (sizesObj) {
            yield Promise.all(Object.keys(sizesObj).map((size) => __awaiter(this, void 0, void 0, function* () {
                var _b, _c, _d, _e;
                const sizePath = sizesObj[size].path;
                const sizeWidth = sizesObj[size].width;
                const sizeHeight = sizesObj[size].height;
                const sizeOptions = sizesObj[size].options;
                newFiles.push(Object.assign(Object.assign({}, fileCopy), { path: sizePath }));
                const sizesCondition = !(0, fs_1.existsSync)(sizePath)
                    || quality !== ((_b = oldSizes === null || oldSizes === void 0 ? void 0 : oldSizes[size]) === null || _b === void 0 ? void 0 : _b.quality)
                    || sizeWidth !== ((_c = oldSizes === null || oldSizes === void 0 ? void 0 : oldSizes[size]) === null || _c === void 0 ? void 0 : _c.width)
                    || sizeHeight !== ((_d = oldSizes === null || oldSizes === void 0 ? void 0 : oldSizes[size]) === null || _d === void 0 ? void 0 : _d.height)
                    || !(0, __1.deepEqual)(sizeOptions, (_e = oldSizes === null || oldSizes === void 0 ? void 0 : oldSizes[size]) === null || _e === void 0 ? void 0 : _e.options);
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
