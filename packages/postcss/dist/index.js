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
exports.postcss = void 0;
/* eslint-disable no-continue */
const path_1 = require("path");
const postcss_1 = __importDefault(require("postcss"));
const core_1 = require("@lollygag/core");
function postcss(options) {
    return function postcssWorker(files) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const { plugins, processOptions } = options !== null && options !== void 0 ? options : {};
            const defaultExtname = '.css';
            const newExtname = (_a = options === null || options === void 0 ? void 0 : options.newExtname) !== null && _a !== void 0 ? _a : defaultExtname;
            const targetExtnames = (_b = options === null || options === void 0 ? void 0 : options.targetExtnames) !== null && _b !== void 0 ? _b : ['.css', '.pcss'];
            const keepOriginal = (_c = options === null || options === void 0 ? void 0 : options.keepOriginal) !== null && _c !== void 0 ? _c : true;
            const makeNewFile = keepOriginal && newExtname !== defaultExtname;
            const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                var _d;
                let _file = file;
                if (makeNewFile)
                    _file = (0, core_1.deepCopy)(file);
                if (!targetExtnames.includes((0, path_1.extname)(_file.path))
                    || (0, core_1.fullExtname)(_file.path).endsWith('.min.css')) {
                    return;
                }
                const existingSourcemap = files.find((f) => f.path === (0, path_1.join)(`${file.path}.map`));
                let filePath = _file.path;
                if (newExtname !== false) {
                    filePath = (0, core_1.changeExtname)(_file.path, newExtname);
                }
                const result = yield (0, postcss_1.default)(plugins).process((_d = _file.content) !== null && _d !== void 0 ? _d : '', Object.assign({ from: file.path, to: filePath, map: {
                        inline: false,
                        prev: existingSourcemap ? existingSourcemap.content : false,
                    } }, processOptions));
                _file.path = filePath;
                _file.content = result.css;
                if (makeNewFile)
                    files.push(_file);
                if (result.map) {
                    if (newExtname) {
                        if (!keepOriginal && existingSourcemap) {
                            existingSourcemap.path = (0, path_1.join)(`${filePath}.map`);
                            existingSourcemap.content = result.map.toString();
                        }
                        else {
                            files.push({
                                path: (0, path_1.join)(`${filePath}.map`),
                                content: result.map.toString(),
                                mimetype: 'application/json',
                            });
                        }
                    }
                    else if (existingSourcemap) {
                        existingSourcemap.content = result.map.toString();
                    }
                    else {
                        files.push({
                            path: (0, path_1.join)(`${filePath}.map`),
                            content: result.map.toString(),
                            mimetype: 'application/json',
                        });
                    }
                }
            }));
            yield Promise.all(promises);
        });
    };
}
exports.postcss = postcss;
exports.default = postcss;
