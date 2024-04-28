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
const fs_1 = require("fs");
const gray_matter_1 = __importDefault(require("gray-matter"));
const general_1 = require("./general");
function parseFiles(files) {
    const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const fileMimetype = yield (0, general_1.getFileMimetype)(file);
        const fileStats = yield fs_1.promises.stat(file);
        if (fileMimetype.startsWith('text/')
            || fileMimetype === 'inode/x-empty') {
            let rawFileContent = yield fs_1.promises.readFile(file, {
                encoding: 'utf-8',
            });
            rawFileContent = this.handleTemplating(rawFileContent, (_a = this._config.templatingHandlerOptions) !== null && _a !== void 0 ? _a : null, Object.assign(Object.assign({}, this._config), this._sitemeta));
            const grayMatterResult = (0, gray_matter_1.default)(rawFileContent);
            grayMatterResult.content = this.handleTemplating(grayMatterResult.content, (_b = this._config.templatingHandlerOptions) !== null && _b !== void 0 ? _b : null, grayMatterResult.data);
            return Object.assign(Object.assign({ path: file, content: grayMatterResult.content, mimetype: fileMimetype }, grayMatterResult.data), { stats: fileStats });
        }
        return { path: file, mimetype: fileMimetype, stats: fileStats };
    }));
    return Promise.all(promises);
}
exports.default = parseFiles;
