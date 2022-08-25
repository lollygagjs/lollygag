"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const glob_1 = __importDefault(require("glob"));
function getFiles(globPattern = (0, path_1.join)(this._in, '/**/*')) {
    return new Promise((res, rej) => {
        (0, glob_1.default)(globPattern, { nodir: true, dot: true }, (err, files) => {
            if (err)
                rej(err);
            else
                res(files);
        });
    });
}
exports.default = getFiles;
