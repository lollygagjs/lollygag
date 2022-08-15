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
        return __awaiter(this, void 0, void 0, function* () {
            if (!files)
                return;
            const { newExtname, targetExtnames, keepOriginal, plugins, processOptions, } = options !== null && options !== void 0 ? options : {};
            const _newExtname = newExtname !== null && newExtname !== void 0 ? newExtname : '.css';
            const _targetExtnames = targetExtnames !== null && targetExtnames !== void 0 ? targetExtnames : ['.css', '.pcss'];
            const _keepOriginal = keepOriginal !== null && keepOriginal !== void 0 ? keepOriginal : true;
            const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let _file = file;
                if (_newExtname && _keepOriginal)
                    _file = Object.assign({}, file);
                if (!_targetExtnames.includes((0, path_1.extname)(_file.path))
                    || (0, core_1.fullExtname)(_file.path).endsWith('.min.css')) {
                    return;
                }
                const existingSourcemap = files.find((f) => f.path === (0, path_1.join)(`${file.path}.map`));
                let filePath = _file.path;
                if (_newExtname !== false) {
                    filePath = (0, core_1.changeExtname)(_file.path, _newExtname);
                }
                const result = yield (0, postcss_1.default)(plugins).process((_a = _file.content) !== null && _a !== void 0 ? _a : '', Object.assign({ from: file.path, to: filePath, map: {
                        inline: false,
                        prev: existingSourcemap ? existingSourcemap.content : false,
                    } }, processOptions));
                _file.path = filePath;
                _file.content = result.css;
                if ((options === null || options === void 0 ? void 0 : options.newExtname) && _keepOriginal) {
                    files.push(_file);
                }
                if (result.map) {
                    if (options === null || options === void 0 ? void 0 : options.newExtname) {
                        if (!_keepOriginal && existingSourcemap) {
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
