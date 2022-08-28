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
exports.processImages = void 0;
const fs_1 = require("fs");
const generateImage_1 = require("./generateImage");
function processImages(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const newFiles = [];
        const { fileCopy, originalFilePath, fullImgPath, fileMimetype, widthsPaths, quality, handlerOptions, previouslyProcessed = false, } = args;
        if (previouslyProcessed ? !(0, fs_1.existsSync)(originalFilePath) : true) {
            yield (0, generateImage_1.generateImage)(originalFilePath, fullImgPath, fileMimetype, handlerOptions, quality);
        }
        if (widthsPaths.length) {
            yield Promise.all(widthsPaths.map((widthPath) => __awaiter(this, void 0, void 0, function* () {
                newFiles.push(Object.assign(Object.assign({}, fileCopy), { path: widthPath }));
                if (previouslyProcessed ? !(0, fs_1.existsSync)(widthPath) : true) {
                    yield (0, generateImage_1.generateImage)(originalFilePath, widthPath, fileMimetype, handlerOptions, quality);
                }
            })));
        }
        return newFiles;
    });
}
exports.processImages = processImages;
